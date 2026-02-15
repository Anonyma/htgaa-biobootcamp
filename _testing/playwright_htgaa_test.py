#!/usr/bin/env python3
"""
HTGAA Week 2 Browser Testing Suite
Tests all major routes to verify content rendering and JS errors.
Run via: ssh CandyPop python3 playwright_htgaa_test.py
"""

from playwright.async_api import async_playwright
import asyncio
import json
from datetime import datetime

async def test_htgaa_week2():
    """Test HTGAA Week 2 study guide with Playwright"""
    
    results = {
        "timestamp": datetime.now().isoformat(),
        "url": "https://htgaa-biobootcamp.netlify.app/",
        "routes": [],
        "summary": {
            "total_routes": 0,
            "routes_with_content": 0,
            "routes_with_errors": 0,
            "total_errors": 0,
            "errors_by_route": {}
        }
    }
    
    routes = [
        "#/",
        "#/topic/sequencing",
        "#/topic/synthesis",
        "#/topic/editing",
        "#/topic/genetic-codes",
        "#/topic/gel-electrophoresis",
        "#/topic/central-dogma",
        "#/flashcards",
        "#/exam",
        "#/glossary",
        "#/compare",
        "#/summary",
        "#/concept-map",
        "#/homework"
    ]
    
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        page = await context.new_page()
        
        console_messages = []
        def handle_console(msg):
            console_messages.append({
                "type": msg.type,
                "text": msg.text
            })
        
        page.on("console", handle_console)
        
        for i, route in enumerate(routes, 1):
            console_messages = []
            route_result = {
                "route": route,
                "has_content": False,
                "content_length": 0,
                "errors": [],
                "warnings": [],
                "success": False
            }
            
            try:
                full_url = f"https://htgaa-biobootcamp.netlify.app/{route}"
                print(f"[{i}/{len(routes)}] Testing {route}...", flush=True)
                await page.goto(full_url, wait_until="domcontentloaded")
                
                await asyncio.sleep(3)
                
                app_content = await page.locator("#app").inner_html()
                route_result["content_length"] = len(app_content) if app_content else 0
                route_result["has_content"] = len(app_content) > 50
                
                for msg in console_messages:
                    if msg["type"] == "error":
                        route_result["errors"].append(msg["text"])
                    elif msg["type"] == "warning":
                        route_result["warnings"].append(msg["text"])
                
                route_result["success"] = route_result["has_content"] and len(route_result["errors"]) == 0
                
                status = "PASS" if route_result["success"] else "FAIL"
                print(f"  {status} | Content: {route_result['content_length']} chars | Errors: {len(route_result['errors'])}", flush=True)
                
            except Exception as e:
                route_result["errors"].append(str(e))
                print(f"  FAIL | Exception: {str(e)[:60]}", flush=True)
            
            results["routes"].append(route_result)
        
        await context.close()
        await browser.close()
    
    results["summary"]["total_routes"] = len(results["routes"])
    results["summary"]["routes_with_content"] = sum(1 for r in results["routes"] if r["has_content"])
    results["summary"]["routes_with_errors"] = sum(1 for r in results["routes"] if r["errors"])
    results["summary"]["total_errors"] = sum(len(r["errors"]) for r in results["routes"])
    
    for route in results["routes"]:
        if route["errors"]:
            results["summary"]["errors_by_route"][route["route"]] = route["errors"]
    
    return results

async def main():
    print("Starting HTGAA Week 2 Browser Test Suite...\n", flush=True)
    results = await test_htgaa_week2()
    
    # Print summary
    print("\n" + "="*70, flush=True)
    print("HTGAA WEEK 2 TEST SUMMARY", flush=True)
    print("="*70, flush=True)
    print(f"Total routes tested: {results['summary']['total_routes']}", flush=True)
    print(f"Routes with content: {results['summary']['routes_with_content']}/{results['summary']['total_routes']}", flush=True)
    print(f"Routes with errors: {results['summary']['routes_with_errors']}/{results['summary']['total_routes']}", flush=True)
    print(f"Total JS errors: {results['summary']['total_errors']}", flush=True)
    print(f"Success rate: {results['summary']['routes_with_content']}/{results['summary']['total_routes']}", flush=True)
    
    if results["summary"]["errors_by_route"]:
        print("\nError summary by route:", flush=True)
        for route, errors in results["summary"]["errors_by_route"].items():
            print(f"  {route}: {len(errors)} error(s)", flush=True)
    
    # Detailed results
    print("\n" + "="*70, flush=True)
    print("ROUTE-BY-ROUTE BREAKDOWN", flush=True)
    print("="*70, flush=True)
    for route in results["routes"]:
        status = "PASS" if route["success"] else "FAIL"
        print(f"{status} {route['route']:30s} {route['content_length']:6d} bytes", flush=True)
    
    return results

if __name__ == "__main__":
    asyncio.run(main())
