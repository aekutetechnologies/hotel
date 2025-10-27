#!/usr/bin/env python
"""
Initialize Database Script
This script runs all data initialization scripts in the correct order.
"""

import os
import sys
import subprocess

def run_script(script_name, description):
    """Run a data initialization script and handle errors."""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(
            [sys.executable, script_name],
            capture_output=True,
            text=True,
            check=True
        )
        
        print(result.stdout)
        print(f"✓ Successfully completed: {description}")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"✗ Error running {script_name}:")
        print(e.stdout)
        print(e.stderr)
        return False
    except Exception as e:
        print(f"✗ Unexpected error: {str(e)}")
        return False


def main():
    """Main function to run all initialization scripts."""
    print("\n" + "="*60)
    print("DATABASE INITIALIZATION SCRIPT")
    print("="*60)
    print("\nThis script will initialize the database with:")
    print("1. Permissions")
    print("2. Amenities")
    print("3. Rules")
    print("4. Documentation Types")
    print("5. States and Union Territories")
    print("\nStarting initialization...\n")
    
    # Change to the backend directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # List of scripts to run in order
    scripts = [
        ('add_permissions.py', 'Adding Permissions'),
        ('add_amenties.py', 'Adding Amenities'),
        ('add_rules.py', 'Adding Rules'),
        ('add_documentation.py', 'Adding Documentation Types'),
        ('add_cities.py', 'Adding States and Union Territories'),
    ]
    
    results = []
    
    # Run each script
    for script_name, description in scripts:
        success = run_script(script_name, description)
        results.append((script_name, success))
        
        if not success:
            print(f"\n⚠ Warning: {description} failed, but continuing with other scripts...")
    
    # Summary
    print("\n" + "="*60)
    print("INITIALIZATION SUMMARY")
    print("="*60)
    
    successful = sum(1 for _, success in results if success)
    failed = sum(1 for _, success in results if not success)
    
    for script_name, success in results:
        status = "✓ SUCCESS" if success else "✗ FAILED"
        print(f"{status:10} - {script_name}")
    
    print("\n" + "="*60)
    print(f"Total: {len(results)} scripts")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    print("="*60)
    
    if failed == 0:
        print("\n✓ All initialization scripts completed successfully!")
        return 0
    else:
        print("\n⚠ Some scripts failed. Please check the errors above.")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
