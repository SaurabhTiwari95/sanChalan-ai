#!/usr/bin/env python3
"""
Backend API Testing for Angular Auth System
Testing Node.js backend with MongoDB
"""

import requests
import sys
import json
from datetime import datetime

class AuthAPITester:
    def __init__(self, base_url="https://login-forge-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session = requests.Session()
        # Test user credentials
        self.test_email = "test@example.com"
        self.test_password = "test123456"
        self.test_name = "Test User"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        
        # Default headers
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)
        
        # Add auth token if available
        if self.token:
            default_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=default_headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=default_headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=default_headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=default_headers)

            print(f"   Response Status: {response.status_code}")
            
            # Parse response
            try:
                response_data = response.json()
                print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
            except:
                response_data = {}
                print(f"   Response Text: {response.text[:200]}...")

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")

            return success, response_data, response

        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            return False, {}, None

    def test_health_check(self):
        """Test API health check"""
        success, response, _ = self.run_test(
            "API Health Check",
            "GET", 
            "",  # Just the base API endpoint
            200
        )
        return success

    def test_register_user(self):
        """Test user registration"""
        success, response, _ = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            201,
            data={
                "name": self.test_name,
                "email": self.test_email,
                "password": self.test_password,
                "confirmPassword": self.test_password
            }
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_data = response.get('user', {})
            print(f"   ✓ Token received: {self.token[:20]}...")
            print(f"   ✓ User ID: {self.user_data.get('user_id', 'N/A')}")
        
        return success

    def test_login_user(self):
        """Test user login"""
        success, response, _ = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": self.test_email,
                "password": self.test_password,
                "rememberMe": False
            }
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_data = response.get('user', {})
            print(f"   ✓ Login token: {self.token[:20]}...")
        
        return success

    def test_login_with_remember_me(self):
        """Test login with remember me"""
        success, response, _ = self.run_test(
            "Login with Remember Me",
            "POST",
            "auth/login",
            200,
            data={
                "email": self.test_email,
                "password": self.test_password,
                "rememberMe": True
            }
        )
        return success

    def test_get_current_user(self):
        """Test getting current user profile"""
        if not self.token:
            print("❌ No token available for user profile test")
            return False
            
        success, response, _ = self.run_test(
            "Get Current User Profile",
            "GET",
            "auth/me",
            200
        )
        
        if success:
            print(f"   ✓ User profile: {response.get('name', 'N/A')} - {response.get('email', 'N/A')}")
        
        return success

    def test_forgot_password(self):
        """Test forgot password functionality"""
        success, response, _ = self.run_test(
            "Forgot Password",
            "POST",
            "auth/forgot-password",
            200,
            data={"email": self.test_email}
        )
        
        if success and 'demo_reset_token' in response:
            reset_token = response['demo_reset_token']
            print(f"   ✓ Reset token received: {reset_token[:20]}...")
            return self.test_reset_password(reset_token)
        
        return success

    def test_reset_password(self, reset_token):
        """Test password reset with token"""
        new_password = "newpass123456"
        success, response, _ = self.run_test(
            "Reset Password",
            "POST",
            "auth/reset-password",
            200,
            data={
                "token": reset_token,
                "password": new_password,
                "confirmPassword": new_password
            }
        )
        
        if success:
            # Update test password and try to login with new password
            old_password = self.test_password
            self.test_password = new_password
            login_success = self.test_login_user()
            self.test_password = old_password  # Reset back
            return login_success
        
        return success

    def test_logout(self):
        """Test user logout"""
        if not self.token:
            print("❌ No token available for logout test")
            return False
            
        success, response, _ = self.run_test(
            "User Logout",
            "POST",
            "auth/logout",
            200
        )
        
        if success:
            # Clear token after successful logout
            self.token = None
            print("   ✓ Token cleared after logout")
        
        return success

    def test_invalid_credentials(self):
        """Test login with invalid credentials"""
        success, response, _ = self.run_test(
            "Login with Invalid Credentials",
            "POST",
            "auth/login",
            401,
            data={
                "email": self.test_email,
                "password": "wrongpassword"
            }
        )
        return success

    def test_invalid_email_format(self):
        """Test registration with invalid email"""
        success, response, _ = self.run_test(
            "Registration with Invalid Email",
            "POST",
            "auth/register",
            400,
            data={
                "name": "Test User",
                "email": "invalid-email",
                "password": "test123456",
                "confirmPassword": "test123456"
            }
        )
        return success

    def test_password_mismatch(self):
        """Test registration with password mismatch"""
        success, response, _ = self.run_test(
            "Registration with Password Mismatch",
            "POST",
            "auth/register",
            400,
            data={
                "name": "Test User",
                "email": "test2@example.com",
                "password": "test123456",
                "confirmPassword": "different123456"
            }
        )
        return success

    def cleanup_test_user(self):
        """Clean up test data (Note: No delete endpoint available, this is informational)"""
        print(f"\n🧹 Cleanup: Test user {self.test_email} should be manually cleaned from DB")

def main():
    """Run all backend API tests"""
    print("=" * 60)
    print("🚀 Starting Backend API Tests for Angular Auth System")
    print("=" * 60)
    
    tester = AuthAPITester()
    
    # Test sequence
    tests = [
        ("Health Check", tester.test_health_check),
        ("Invalid Email Format", tester.test_invalid_email_format),
        ("Password Mismatch", tester.test_password_mismatch),
        ("User Registration", tester.test_register_user),
        ("User Login", tester.test_login_user),
        ("Login with Remember Me", tester.test_login_with_remember_me),
        ("Get Current User", tester.test_get_current_user),
        ("Invalid Credentials", tester.test_invalid_credentials),
        ("Forgot Password Flow", tester.test_forgot_password),
        ("User Logout", tester.test_logout),
    ]
    
    print(f"\n📋 Running {len(tests)} test cases...\n")
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            if not result:
                print(f"⚠️  Test '{test_name}' failed but continuing...")
        except Exception as e:
            print(f"💥 Test '{test_name}' threw exception: {str(e)}")
    
    # Cleanup
    tester.cleanup_test_user()
    
    # Final results
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%" if tester.tests_run > 0 else "0%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All backend tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())