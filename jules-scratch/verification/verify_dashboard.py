import json
from playwright.sync_api import sync_playwright, Page, expect

def test_dashboard_loads(page: Page):
    """
    This script uses absolute paths for screenshots to ensure they are saved correctly.
    """
    # Define absolute paths for screenshots
    SUCCESS_SCREENSHOT_PATH = "/app/jules-scratch/verification/verification.png"
    FAILURE_SCREENSHOT_PATH = "/app/jules-scratch/verification/failure_screenshot.png"

    # 1. Go to the origin to set localStorage context.
    page.goto("http://localhost:5173/")

    # 2. Inject authentication data into localStorage.
    page.evaluate("""() => {
        const mockUser = {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            subscription: { plan: 'free', promptsPerDay: 8, promptsUsedToday: 0 }
        };
        localStorage.setItem('auth_token', 'mock-test-token');
        localStorage.setItem('user_data', JSON.stringify(mockUser));
    }""")

    # 3. Navigate directly to the dashboard.
    page.goto("http://localhost:5173/dashboard")

    try:
        # 4. Assert: Wait for the main heading of the dashboard to be visible.
        dashboard_heading = page.get_by_role("heading", name="My Projects")
        expect(dashboard_heading).to_be_visible(timeout=15000)

        print("Dashboard loaded successfully. Proceeding to test project creation.")
        new_project_button = page.get_by_role("button", name="New Project")
        new_project_button.click()

        page.get_by_label("Project Name").fill("My Verified Project")
        page.get_by_label("Description").fill("This was verified with an absolute path.")

        create_button = page.get_by_role("button", name="Create Project")
        create_button.click()

        expect(page.get_by_text("My Verified Project")).to_be_visible()

        # 5. Take the final success screenshot using an absolute path.
        page.screenshot(path=SUCCESS_SCREENSHOT_PATH)
        print(f"Success screenshot taken at {SUCCESS_SCREENSHOT_PATH}")

    except Exception as e:
        print(f"An error occurred: {e}")
        # Take a failure screenshot using an absolute path.
        page.screenshot(path=FAILURE_SCREENSHOT_PATH)
        print(f"Failure screenshot taken at {FAILURE_SCREENSHOT_PATH}")
        raise

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        test_dashboard_loads(page)
        browser.close()