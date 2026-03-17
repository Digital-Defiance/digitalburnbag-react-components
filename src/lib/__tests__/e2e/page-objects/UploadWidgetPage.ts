/**
 * Page Object Model for the UploadWidget component.
 *
 * The upload widget is rendered inline on the "My Files" section of BurnbagPage.
 */
import { Locator, Page } from '@playwright/test';

export class UploadWidgetPage {
  readonly page: Page;
  readonly dropZone: Locator;
  readonly fileInput: Locator;
  readonly progressBars: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dropZone = page.getByText(/drag.*drop|drop.*files|click to browse/i);
    this.fileInput = page.locator('input[type="file"]');
    this.progressBars = page.getByRole('progressbar');
  }

  async uploadFile(name: string, content: string, mimeType = 'text/plain') {
    await this.fileInput.setInputFiles({
      name,
      mimeType,
      buffer: Buffer.from(content),
    });
  }

  async uploadMultipleFiles(
    files: { name: string; content: string; mimeType?: string }[],
  ) {
    await this.fileInput.setInputFiles(
      files.map((f) => ({
        name: f.name,
        mimeType: f.mimeType ?? 'text/plain',
        buffer: Buffer.from(f.content),
      })),
    );
  }

  async waitForUploadComplete(timeout = 30_000) {
    // Wait for all progress bars to disappear
    await this.page.waitForFunction(
      () =>
        window.document.querySelectorAll('[role="progressbar"]').length === 0,
      { timeout },
    );
  }

  async getProgressCount(): Promise<number> {
    return this.progressBars.count();
  }
}
