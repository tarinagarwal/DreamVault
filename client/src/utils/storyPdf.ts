import jsPDF from "jspdf";

export interface StoryData {
  title: string;
  content: string;
  genre?: string;
  wordCount?: number;
  dreamTitle: string;
  dreamDescription: string;
  createdAt: string;
}

export class StoryPDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;
  private lineHeight: number;

  // Theme colors matching the website (from tailwind config)
  private colors = {
    primary: [5, 150, 105] as [number, number, number], // brand-600 - Deep forest green
    secondary: [4, 120, 87] as [number, number, number], // brand-700 - Darker forest
    text: [255, 255, 255] as [number, number, number], // White text
    textSecondary: [209, 213, 219] as [number, number, number], // Gray-300
    textMuted: [156, 163, 175] as [number, number, number], // Gray-400
    background: [17, 24, 39] as [number, number, number], // bg-neutral-900
    cardBg: [55, 65, 81] as [number, number, number], // bg-neutral-700
    accent: [245, 158, 11] as [number, number, number], // Warning-400 - Amber accent
  };

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
    this.lineHeight = 7;
  }

  private addNewPageIfNeeded(requiredHeight: number): void {
    if (this.currentY + requiredHeight > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.addPageBackground();
      this.currentY = this.margin;
    }
  }

  private addPageBackground(): void {
    // Add dark background to match website theme
    this.doc.setFillColor(...this.colors.background);
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, "F");
  }

  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    this.doc.setFontSize(fontSize);
    return this.doc.splitTextToSize(text, maxWidth);
  }

  private addTitle(title: string): void {
    this.doc.setFontSize(24);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...this.colors.primary);

    const titleLines = this.wrapText(
      title,
      this.pageWidth - 2 * this.margin,
      24
    );
    const titleHeight = titleLines.length * 12;

    this.addNewPageIfNeeded(titleHeight + 20);

    titleLines.forEach((line, index) => {
      this.doc.text(line, this.pageWidth / 2, this.currentY + index * 12, {
        align: "center",
      });
    });

    this.currentY += titleHeight + 20;

    // Add decorative line
    this.doc.setDrawColor(...this.colors.primary);
    this.doc.setLineWidth(1);
    this.doc.line(
      this.pageWidth / 2 - 30,
      this.currentY - 10,
      this.pageWidth / 2 + 30,
      this.currentY - 10
    );
  }

  private addMetadata(story: StoryData): void {
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...this.colors.textMuted);

    const metadata = [
      `Genre: ${story.genre || "Unknown"}`,
      `Word Count: ${story.wordCount || 0}`,
      `Created: ${new Date(story.createdAt).toLocaleDateString()}`,
      `Reading Time: ${Math.ceil((story.wordCount || 0) / 200)} minutes`,
    ];

    this.addNewPageIfNeeded(metadata.length * this.lineHeight + 20);

    metadata.forEach((item, index) => {
      this.doc.text(
        item,
        this.pageWidth / 2,
        this.currentY + index * this.lineHeight,
        { align: "center" }
      );
    });

    this.currentY += metadata.length * this.lineHeight + 30;
  }

  private addDreamContext(story: StoryData): void {
    if (!story.dreamTitle && !story.dreamDescription) return;

    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...this.colors.accent);

    this.addNewPageIfNeeded(20);
    this.doc.text("Inspired by Dream:", this.margin, this.currentY);
    this.currentY += 15;

    if (story.dreamTitle) {
      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(...this.colors.text);

      const titleLines = this.wrapText(
        story.dreamTitle,
        this.pageWidth - 2 * this.margin,
        12
      );
      this.addNewPageIfNeeded(titleLines.length * this.lineHeight);

      titleLines.forEach((line, index) => {
        this.doc.text(
          line,
          this.margin,
          this.currentY + index * this.lineHeight
        );
      });

      this.currentY += titleLines.length * this.lineHeight + 5;
    }

    if (story.dreamDescription) {
      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(...this.colors.textSecondary);

      const descLines = this.wrapText(
        story.dreamDescription,
        this.pageWidth - 2 * this.margin,
        10
      );
      this.addNewPageIfNeeded(descLines.length * this.lineHeight);

      descLines.forEach((line, index) => {
        this.doc.text(
          line,
          this.margin,
          this.currentY + index * this.lineHeight
        );
      });

      this.currentY += descLines.length * this.lineHeight + 25;
    }
  }

  private addStoryContent(content: string): void {
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...this.colors.text);

    const paragraphs = content.split("\n\n").filter((p) => p.trim());

    paragraphs.forEach((paragraph, index) => {
      const lines = this.wrapText(
        paragraph.trim(),
        this.pageWidth - 2 * this.margin,
        12
      );
      const paragraphHeight = lines.length * this.lineHeight + 10;

      this.addNewPageIfNeeded(paragraphHeight);

      lines.forEach((line, lineIndex) => {
        this.doc.text(
          line,
          this.margin,
          this.currentY + lineIndex * this.lineHeight
        );
      });

      this.currentY += lines.length * this.lineHeight + 10;

      // Add extra space between paragraphs
      if (index < paragraphs.length - 1) {
        this.currentY += 5;
      }
    });
  }

  private addFooter(): void {
    const totalPages = this.doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(...this.colors.textMuted);

      // Page number
      this.doc.text(
        `Page ${i} of ${totalPages}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: "center" }
      );

      // Branding
      this.doc.text(
        "Generated by DreamVault",
        this.pageWidth - this.margin,
        this.pageHeight - 10,
        { align: "right" }
      );
    }
  }

  private addCoverPage(story: StoryData): void {
    // Dark background matching website theme
    this.doc.setFillColor(...this.colors.background);
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, "F");

    // Add decorative elements
    this.addCoverDecorations();

    // Main title with better positioning
    this.doc.setFontSize(32);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...this.colors.primary);

    const titleLines = this.wrapText(story.title, this.pageWidth - 60, 32);
    let titleY = 80;

    titleLines.forEach((line, index) => {
      this.doc.text(line, this.pageWidth / 2, titleY + index * 18, {
        align: "center",
      });
    });

    // Subtitle with gradient-like effect
    const subtitleY = titleY + titleLines.length * 18 + 25;
    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...this.colors.accent);
    this.doc.text("A Story from DreamVault", this.pageWidth / 2, subtitleY, {
      align: "center",
    });

    // Genre badge with background
    const genreY = subtitleY + 30;
    this.addGenreBadge(story.genre, genreY);

    // Dream context in a card-like design
    if (story.dreamTitle) {
      this.addDreamCard(story, genreY + 40);
    }

    // Metadata at bottom
    this.addCoverMetadata(story);

    // Add new page for content
    this.doc.addPage();
    this.addPageBackground();
    this.currentY = this.margin;
  }

  private addCoverDecorations(): void {
    // Add subtle geometric patterns
    this.doc.setDrawColor(...this.colors.primary);
    this.doc.setLineWidth(0.5);

    // Top decorative lines
    for (let i = 0; i < 3; i++) {
      const y = 25 + i * 3;
      this.doc.line(30, y, 60, y);
      this.doc.line(this.pageWidth - 60, y, this.pageWidth - 30, y);
    }

    // Corner decorations
    this.doc.setDrawColor(...this.colors.accent);
    this.doc.setLineWidth(1);

    // Top left corner
    this.doc.line(20, 20, 40, 20);
    this.doc.line(20, 20, 20, 40);

    // Top right corner
    this.doc.line(this.pageWidth - 40, 20, this.pageWidth - 20, 20);
    this.doc.line(this.pageWidth - 20, 20, this.pageWidth - 20, 40);

    // Bottom left corner
    this.doc.line(20, this.pageHeight - 40, 20, this.pageHeight - 20);
    this.doc.line(20, this.pageHeight - 20, 40, this.pageHeight - 20);

    // Bottom right corner
    this.doc.line(
      this.pageWidth - 20,
      this.pageHeight - 40,
      this.pageWidth - 20,
      this.pageHeight - 20
    );
    this.doc.line(
      this.pageWidth - 40,
      this.pageHeight - 20,
      this.pageWidth - 20,
      this.pageHeight - 20
    );
  }

  private addGenreBadge(genre: string | undefined, y: number): void {
    const badgeWidth = 80;
    const badgeHeight = 20;
    const badgeX = (this.pageWidth - badgeWidth) / 2;

    // Badge background
    this.doc.setFillColor(...this.colors.cardBg);
    this.doc.roundedRect(badgeX, y - 10, badgeWidth, badgeHeight, 5, 5, "F");

    // Badge border
    this.doc.setDrawColor(...this.colors.primary);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(badgeX, y - 10, badgeWidth, badgeHeight, 5, 5, "S");

    // Badge text
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...this.colors.text);
    this.doc.text(genre || "Unknown", this.pageWidth / 2, y + 2, {
      align: "center",
    });
  }

  private addDreamCard(story: StoryData, y: number): void {
    const cardWidth = this.pageWidth - 80;
    const cardX = 40;
    const cardHeight = 60;

    // Card background
    this.doc.setFillColor(...this.colors.cardBg);
    this.doc.roundedRect(cardX, y, cardWidth, cardHeight, 8, 8, "F");

    // Card border
    this.doc.setDrawColor(...this.colors.primary);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(cardX, y, cardWidth, cardHeight, 8, 8, "S");

    // Card title
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...this.colors.accent);
    this.doc.text("Inspired by Dream:", cardX + 10, y + 15);

    // Dream title
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...this.colors.text);
    const dreamTitleLines = this.wrapText(story.dreamTitle, cardWidth - 20, 12);
    dreamTitleLines.slice(0, 2).forEach((line, index) => {
      this.doc.text(line, cardX + 10, y + 28 + index * 8);
    });

    // Dream description (truncated)
    if (story.dreamDescription) {
      this.doc.setFontSize(9);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(...this.colors.textSecondary);
      const descLines = this.wrapText(
        story.dreamDescription,
        cardWidth - 20,
        9
      );
      const truncatedDesc =
        descLines[0].length > 60
          ? descLines[0].substring(0, 60) + "..."
          : descLines[0];
      this.doc.text(truncatedDesc, cardX + 10, y + 48);
    }
  }

  private addCoverMetadata(story: StoryData): void {
    const metadataY = this.pageHeight - 60;

    // Stats in a row
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...this.colors.textMuted);

    const stats = [
      `${story.wordCount || 0} words`,
      `${Math.ceil((story.wordCount || 0) / 200)} min read`,
      new Date(story.createdAt).toLocaleDateString(),
    ];

    const statSpacing = (this.pageWidth - 80) / stats.length;
    stats.forEach((stat, index) => {
      this.doc.text(stat, 40 + index * statSpacing, metadataY, {
        align: "left",
      });
    });

    // Branding
    this.doc.setFontSize(8);
    this.doc.setTextColor(...this.colors.textMuted);
    this.doc.text(
      "DreamVault - Where Dreams Become Stories",
      this.pageWidth / 2,
      this.pageHeight - 30,
      { align: "center" }
    );
  }

  public generatePDF(story: StoryData): jsPDF {
    // Add cover page
    this.addCoverPage(story);

    // Add story title
    this.addTitle(story.title);

    // Add metadata
    this.addMetadata(story);

    // Add dream context
    this.addDreamContext(story);

    // Add story content
    this.addStoryContent(story.content);

    // Add footer to all pages
    this.addFooter();

    return this.doc;
  }

  public downloadPDF(story: StoryData, filename?: string): void {
    const pdf = this.generatePDF(story);
    const fileName =
      filename || `${story.title.replace(/[^a-zA-Z0-9]/g, "_")}_story.pdf`;
    pdf.save(fileName);
  }
}

// Utility functions
export const generateStoryPDF = (story: StoryData, filename?: string): void => {
  const generator = new StoryPDFGenerator();
  generator.downloadPDF(story, filename);
};

export const shareStory = async (story: StoryData): Promise<void> => {
  const shareData = {
    title: story.title,
    text: `Check out this amazing story: "${story.title}" - ${story.genre} story with ${story.wordCount} words.`,
    url: window.location.href,
  };

  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      console.log("Error sharing:", error);
      // Fallback to clipboard
      await copyToClipboard(shareData.url);
    }
  } else {
    // Fallback to clipboard
    await copyToClipboard(shareData.url);
  }
};

const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    // You might want to show a toast notification here
    alert("Link copied to clipboard!");
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    alert("Link copied to clipboard!");
  }
};
