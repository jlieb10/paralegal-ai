import re
import hashlib
from typing import List, Tuple, Optional
from .schemas import SpanModel


class SpanLinker:
    """Maps summary bullets to exact spans in source text"""
    
    def __init__(self, plaintext: str, html_anchors: dict[str, dict[str, int]]):
        self.plaintext = plaintext
        self.html_anchors = html_anchors
    
    def find_spans_for_text(self, bullet_text: str) -> Tuple[List[SpanModel], List[str]]:
        """Find shortest unique spans for bullet text"""
        # Extract key phrases from bullet (simplified)
        key_phrases = self._extract_key_phrases(bullet_text)
        spans = []
        anchors = []
        
        for phrase in key_phrases:
            span, anchor = self._find_shortest_span(phrase)
            if span:
                spans.append(span)
                if anchor:
                    anchors.append(anchor)
        
        return spans, anchors
    
    def _extract_key_phrases(self, text: str) -> List[str]:
        """Extract meaningful phrases from bullet text"""
        # Remove common legal words and get substantive phrases
        # This is simplified - production would use NLP
        words = re.findall(r'\b\w+\b', text.lower())
        stopwords = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
        
        meaningful_words = [w for w in words if w not in stopwords and len(w) > 3]
        
        # Return phrases of 2-4 words
        phrases = []
        for i in range(len(meaningful_words) - 1):
            phrase = ' '.join(meaningful_words[i:i+2])
            phrases.append(phrase)
        
        return phrases[:3]  # Top 3 phrases
    
    def _find_shortest_span(self, phrase: str) -> Tuple[Optional[SpanModel], Optional[str]]:
        """Find shortest span containing phrase"""
        phrase_lower = phrase.lower()
        text_lower = self.plaintext.lower()
        
        # Find all occurrences
        start = 0
        while True:
            pos = text_lower.find(phrase_lower, start)
            if pos == -1:
                break
            
            # Find word boundaries for clean span
            span_start = pos
            span_end = pos + len(phrase)
            
            # Expand to word boundaries
            while span_start > 0 and self.plaintext[span_start - 1].isalnum():
                span_start -= 1
            while span_end < len(self.plaintext) and self.plaintext[span_end].isalnum():
                span_end += 1
            
            span = SpanModel(start=span_start, end=span_end)
            anchor = self._find_closest_anchor(span_start)
            
            return span, anchor
        
        return None, None
    
    def _find_closest_anchor(self, position: int) -> Optional[str]:
        """Find closest HTML anchor to position"""
        best_anchor = None
        min_distance = float('inf')
        
        for anchor_id, anchor_pos in self.html_anchors.items():
            distance = abs(anchor_pos['start'] - position)
            if distance < min_distance:
                min_distance = distance
                best_anchor = f"#{anchor_id}"
        
        return best_anchor


def generate_html_anchors(plaintext: str) -> dict[str, dict[str, int]]:
    """Generate stable HTML anchors for paragraphs"""
    anchors = {}
    paragraphs = plaintext.split('\n\n')
    current_pos = 0
    
    for i, para in enumerate(paragraphs):
        if para.strip():
            # Generate stable anchor ID based on content
            para_hash = hashlib.md5(para.strip().encode()).hexdigest()[:8]
            anchor_id = f"para-{i}-{para_hash}"
            
            anchors[anchor_id] = {
                'start': current_pos,
                'end': current_pos + len(para)
            }
        
        current_pos += len(para) + 2  # +2 for \n\n
    
    return anchors