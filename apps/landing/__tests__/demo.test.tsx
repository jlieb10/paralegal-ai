import { render, screen, fireEvent } from "@testing-library/react";
import DemoPage from "../src/app/demo/page";
import "@testing-library/jest-dom";

// Mock framer-motion to avoid animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe("Demo Page", () => {
  beforeEach(() => {
    render(<DemoPage />);
  });

  describe("Page Structure", () => {
    it("should render main heading", () => {
      expect(screen.getByRole("heading", { name: /live demo/i })).toBeInTheDocument();
    });

    it("should render description", () => {
      expect(screen.getByText(/interactive demonstration of privacy-first email summarization/i)).toBeInTheDocument();
    });

    it("should render section toggle buttons", () => {
      expect(screen.getByRole("button", { name: /ai summary/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /original email/i })).toBeInTheDocument();
    });

    it("should render privacy guarantee section", () => {
      expect(screen.getByRole("heading", { name: /privacy guarantee/i })).toBeInTheDocument();
      expect(screen.getByText(/this demo uses mock data/i)).toBeInTheDocument();
    });
  });

  describe("Summary Section", () => {
    it("should render summary bullets heading", () => {
      expect(screen.getByRole("heading", { name: /summary bullets/i })).toBeInTheDocument();
    });

    it("should render all summary bullets", () => {
      const expectedBullets = [
        "Counterparty proposes reducing liability cap to 1x fees under the agreement.",
        "Client requests execution by August 30, 2025 to meet project deadline.",
        "Indemnification clause on page 12 requires review for excessive exposure.",
        "Governing law specified as New York with venue in Manhattan courts.",
      ];

      expectedBullets.forEach((bullet) => {
        expect(screen.getByText(bullet)).toBeInTheDocument();
      });
    });

    it("should render link to source buttons for each bullet", () => {
      const linkButtons = screen.getAllByText(/link to source/i);
      expect(linkButtons).toHaveLength(4);
    });

    it("should render contract flags section", () => {
      expect(screen.getByRole("heading", { name: /contract flags/i })).toBeInTheDocument();
    });

    it("should render contract flags with correct severity levels", () => {
      // Use getAllByText since there are multiple HIGH flags
      const highFlags = screen.getAllByText("HIGH");
      const mediumFlags = screen.getAllByText("MEDIUM");
      
      expect(highFlags.length).toBe(2); // We expect 2 HIGH flags in the mock data
      expect(mediumFlags.length).toBe(1); // We expect 1 MEDIUM flag
    });

    it("should render flag types correctly", () => {
      expect(screen.getByText(/LIABILITY CAP.*1x fees/)).toBeInTheDocument();
      expect(screen.getByText(/DATE DEADLINE/)).toBeInTheDocument(); 
      expect(screen.getByText(/INDEMNITY/)).toBeInTheDocument();
    });

    it("should render view in email buttons for flags", () => {
      const viewButtons = screen.getAllByText(/view in email/i);
      expect(viewButtons).toHaveLength(3);
    });
  });

  describe("Email Section", () => {
    it("should render original email heading", () => {
      expect(screen.getByRole("heading", { name: /original email/i })).toBeInTheDocument();
    });

    it("should render email content", () => {
      expect(screen.getByText(/dear counsel/i)).toBeInTheDocument();
      expect(screen.getByText(/sarah johnson/i)).toBeInTheDocument();
      expect(screen.getByText(/johnsonlaw.com/i)).toBeInTheDocument();
    });

    it("should render deployment information", () => {
      expect(screen.getByText(/in a real deployment/i)).toBeInTheDocument();
      expect(screen.getByText(/clicking 🔗 links scrolls to exact text spans/i)).toBeInTheDocument();
      expect(screen.getByText(/html anchors provide stable reference points/i)).toBeInTheDocument();
      expect(screen.getByText(/byte-offset precision ensures accuracy/i)).toBeInTheDocument();
    });
  });

  describe("Interactive Functionality", () => {
    it("should handle AI Summary button click", () => {
      const summaryButton = screen.getByRole("button", { name: /ai summary/i });
      const emailButton = screen.getByRole("button", { name: /original email/i });

      // Click Original Email first to change state
      fireEvent.click(emailButton);
      
      // Then click AI Summary to test the interaction
      fireEvent.click(summaryButton);

      // Both buttons should still be present and clickable
      expect(summaryButton).toBeInTheDocument();
      expect(emailButton).toBeInTheDocument();
    });

    it("should handle Original Email button click", () => {
      const emailButton = screen.getByRole("button", { name: /original email/i });
      fireEvent.click(emailButton);

      // Button should still be present after click
      expect(emailButton).toBeInTheDocument();
    });

    it("should handle link to source button clicks", () => {
      const linkButtons = screen.getAllByText(/link to source/i);
      
      // Click first link button
      fireEvent.click(linkButtons[0]);
      
      // Button should still be present after click
      expect(linkButtons[0]).toBeInTheDocument();
    });

    it("should handle view in email button clicks", () => {
      const viewButtons = screen.getAllByText(/view in email/i);
      
      // Click first view button
      fireEvent.click(viewButtons[0]);
      
      // Button should still be present after click
      expect(viewButtons[0]).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("should render back to home link", () => {
      const backLink = screen.getByRole("link", { name: /back to home/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute("href", "/");
    });

    it("should render Paralegal AI brand link", () => {
      const brandLink = screen.getByRole("link", { name: /paralegal ai/i });
      expect(brandLink).toBeInTheDocument();
      expect(brandLink).toHaveAttribute("href", "/");
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      const h1 = screen.getByRole("heading", { level: 1 });
      const h2s = screen.getAllByRole("heading", { level: 2 });
      const h3s = screen.getAllByRole("heading", { level: 3 });

      expect(h1).toBeInTheDocument();
      expect(h2s.length).toBeGreaterThan(0);
      expect(h3s.length).toBeGreaterThan(0);
    });

    it("should have proper button roles", () => {
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
      
      // All buttons should have accessible names
      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });
    });

    it("should have proper link roles", () => {
      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
      
      // All links should have accessible names and href attributes
      links.forEach((link) => {
        expect(link).toHaveAccessibleName();
        expect(link).toHaveAttribute("href");
      });
    });
  });
});