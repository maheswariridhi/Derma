#!/usr/bin/env python3
"""
Test script for AI educational content endpoints (Claude)
Run this after setting up your environment variables and starting the backend server
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"Health check: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_treatments_endpoint():
    """Test getting treatments"""
    try:
        response = requests.get(f"{BASE_URL}/api/treatments")
        print(f"Treatments endpoint: {response.status_code}")
        if response.status_code == 200:
            treatments = response.json()
            print(f"Found {len(treatments)} treatments")
            if treatments:
                print(f"First treatment: {treatments[0]}")
                return treatments[0]['id']
        return None
    except Exception as e:
        print(f"Treatments endpoint failed: {e}")
        return None

def test_medicines_endpoint():
    """Test getting medicines"""
    try:
        response = requests.get(f"{BASE_URL}/api/medicines")
        print(f"Medicines endpoint: {response.status_code}")
        if response.status_code == 200:
            medicines = response.json()
            print(f"Found {len(medicines)} medicines")
            if medicines:
                print(f"First medicine: {medicines[0]}")
                return medicines[0]['id']
        return None
    except Exception as e:
        print(f"Medicines endpoint failed: {e}")
        return None

def test_treatment_info_endpoint(item_type, item_id):
    """Test the treatment info endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/treatment-info/{item_type}/{item_id}")
        print(f"Treatment info endpoint ({item_type}/{item_id}): {response.status_code}")
        if response.status_code == 200:
            info = response.json()
            print(f"Generated explanation: {info.get('explanation', 'No explanation')[:100]}...")
            return True
        else:
            print(f"Error response: {response.text}")
            return False
    except Exception as e:
        print(f"Treatment info endpoint failed: {e}")
        return False

def test_generate_endpoint(item_type, item_id):
    """Test the generate endpoint"""
    try:
        data = {
            "item_type": item_type,
            "item_id": item_id
        }
        response = requests.post(f"{BASE_URL}/api/treatment-info/generate", json=data)
        print(f"Generate endpoint ({item_type}/{item_id}): {response.status_code}")
        if response.status_code == 200:
            info = response.json()
            print(f"Generated explanation: {info.get('explanation', 'No explanation')[:100]}...")
            return True
        else:
            print(f"Error response: {response.text}")
            return False
    except Exception as e:
        print(f"Generate endpoint failed: {e}")
        return False

def main():
    """Run all tests"""
    print("Testing AI Educational Content Endpoints (Claude)")
    print("=" * 50)
    
    # Test health check
    if not test_health_check():
        print("❌ Health check failed. Make sure the backend server is running.")
        return
    
    print("✅ Health check passed")
    
    # Test getting treatments
    treatment_id = test_treatments_endpoint()
    if treatment_id:
        print("✅ Treatments endpoint working")
        
        # Test treatment info
        if test_treatment_info_endpoint("treatment", treatment_id):
            print("✅ Treatment info endpoint working")
        else:
            print("❌ Treatment info endpoint failed")
            
        # Test generate endpoint for treatment
        if test_generate_endpoint("treatment", treatment_id):
            print("✅ Generate endpoint working for treatments")
        else:
            print("❌ Generate endpoint failed for treatments")
    else:
        print("❌ No treatments found or endpoint failed")
    
    # Test getting medicines
    medicine_id = test_medicines_endpoint()
    if medicine_id:
        print("✅ Medicines endpoint working")
        
        # Test medicine info
        if test_treatment_info_endpoint("medicine", medicine_id):
            print("✅ Medicine info endpoint working")
        else:
            print("❌ Medicine info endpoint failed")
            
        # Test generate endpoint for medicine
        if test_generate_endpoint("medicine", medicine_id):
            print("✅ Generate endpoint working for medicines")
        else:
            print("❌ Generate endpoint failed for medicines")
    else:
        print("❌ No medicines found or endpoint failed")
    
    print("\n" + "=" * 50)
    print("Test completed!")

if __name__ == "__main__":
    main() 