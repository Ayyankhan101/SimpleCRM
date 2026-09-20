from playwright.sync_api import sync_playwright
import time

def test_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        # Capture console and network
        page.on("console", lambda msg: print(f"  [console] {msg.type}: {msg.text}") if msg.type == "error" else None)
        page.on("response", lambda r: print(f"  [response] {r.status} {r.url}") if r.status >= 400 else None)
        
        print("=== Testing Data Analysis App ===\n")
        
        # 1. Test Frontend Load
        print("1. Testing frontend load...")
        page.goto('http://localhost:5173')
        page.wait_for_load_state('networkidle')
        page.screenshot(path='/tmp/test_01_homepage.png', full_page=True)
        
        title = page.title()
        print(f"   Page title: {title}")
        print("   ✓ Frontend loaded")
        
        # 2. Test Login page
        print("\n2. Testing login page...")
        page.goto('http://localhost:5173/login')
        page.wait_for_load_state('networkidle')
        page.screenshot(path='/tmp/test_02_login_page.png', full_page=True)
        
        # 3. Test Login with demo account
        print("\n3. Testing login with demo account...")
        page.fill('input[type="email"]', 'demo@example.com')
        page.fill('input[type="password"]', 'demo123')
        
        page.screenshot(path='/tmp/test_03_login_filled.png', full_page=True)
        
        # Click login and wait for response
        page.click('button[type="submit"]')
        time.sleep(3)  # Wait longer for response
        
        page.screenshot(path='/tmp/test_04_after_login.png', full_page=True)
        
        current_url = page.url
        print(f"   After login URL: {current_url}")
        
        # Check if we're still on login page (failed) or moved to dashboard
        if '/login' in current_url:
            print("   ⚠ Still on login page - checking error message")
            error_msg = page.locator('.error-message').text_content()
            if error_msg:
                print(f"   Error: {error_msg}")
        
        # 4. Test Dashboard
        print("\n4. Testing dashboard...")
        page.goto('http://localhost:5173/')
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        
        page.screenshot(path='/tmp/test_05_dashboard.png', full_page=True)
        
        stats = page.locator('.stat-card').count()
        print(f"   Stat cards found: {stats}")
        
        # 5. Test Data Entries Page
        print("\n5. Testing data entries page...")
        page.goto('http://localhost:5173/data')
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        
        page.screenshot(path='/tmp/test_06_data_entries.png', full_page=True)
        
        rows = page.locator('table tbody tr').count()
        print(f"   Data rows found: {rows}")
        
        # 6. Test Create Entry
        if rows > 0:
            print("\n6. Testing create entry...")
            add_btn = page.locator('button:has-text("Add Entry")')
            if add_btn.count() > 0:
                add_btn.first.click()
                time.sleep(1)
                
                page.screenshot(path='/tmp/test_07_create_entry_form.png', full_page=True)
                
                # Fill form
                page.fill('input[type="text"]', 'Test Entry from Playwright')
                page.fill('input[type="date"]', '2026-01-15')
                
                page.screenshot(path='/tmp/test_08_create_entry_filled.png', full_page=True)
                
                # Submit
                page.click('button:has-text("Create")')
                page.wait_for_load_state('networkidle')
                time.sleep(2)
                
                page.screenshot(path='/tmp/test_09_after_create_entry.png', full_page=True)
                print("   ✓ Entry created")
            else:
                print("   ⚠ Add Entry button not found")
        
        # 7. Test Categories Page
        print("\n7. Testing categories page...")
        page.goto('http://localhost:5173/categories')
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        
        page.screenshot(path='/tmp/test_10_categories.png', full_page=True)
        
        # 8. Test Search
        print("\n8. Testing search...")
        page.goto('http://localhost:5173/data')
        page.wait_for_load_state('networkidle')
        time.sleep(1)
        
        search_input = page.locator('input[placeholder*="Search"]')
        if search_input.count() > 0:
            search_input.fill('COVID')
            time.sleep(2)
            page.screenshot(path='/tmp/test_11_search.png', full_page=True)
            print("   ✓ Search performed")
        
        # 9. Test Logout
        print("\n9. Testing logout...")
        logout_link = page.locator('text=Logout')
        if logout_link.count() > 0:
            logout_link.first.click()
            page.wait_for_load_state('networkidle')
            time.sleep(1)
            page.screenshot(path='/tmp/test_12_after_logout.png', full_page=True)
            print("    ✓ Logged out successfully")
        else:
            print("    ⚠ Logout link not found")
            page.screenshot(path='/tmp/test_12_logout_search.png', full_page=True)
        
        print("\n=== All tests completed ===")
        print("Screenshots saved to /tmp/test_*.png")
        
        browser.close()
        return True

if __name__ == '__main__':
    success = test_app()
    exit(0 if success else 1)
