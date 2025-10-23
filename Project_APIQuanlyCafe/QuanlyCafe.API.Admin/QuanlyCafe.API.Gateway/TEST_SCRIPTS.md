# Test Script - PowerShell

## Test Gateway Routing

M? PowerShell và ch?y các l?nh sau ?? test:

### 1. Test Admin API qua Gateway

```powershell
# Test Authentication - Login Admin
$loginBody = @{
    tenDangNhap = "admin"
    matKhau = "123456"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/admin/api/Authentication/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json" `
    -SessionVariable session

Write-Host "Login Response:" -ForegroundColor Green
$loginResponse | ConvertTo-Json

# Test Get All Món ?n
Write-Host "`nGet All Products:" -ForegroundColor Green
$products = Invoke-RestMethod -Uri "http://localhost:5000/admin/api/Product/monan" `
    -Method GET `
    -WebSession $session

$products | ConvertTo-Json

# Test Get All Danh M?c
Write-Host "`nGet All Categories:" -ForegroundColor Green
$categories = Invoke-RestMethod -Uri "http://localhost:5000/admin/api/Product/danhmuc" `
    -Method GET `
    -WebSession $session

$categories | ConvertTo-Json

# Test Get All Employees
Write-Host "`nGet All Employees:" -ForegroundColor Green
$employees = Invoke-RestMethod -Uri "http://localhost:5000/admin/api/Employees" `
    -Method GET `
    -WebSession $session

$employees | ConvertTo-Json

# Test Get All Tables
Write-Host "`nGet All Tables:" -ForegroundColor Green
$tables = Invoke-RestMethod -Uri "http://localhost:5000/admin/api/Ban" `
    -Method GET `
    -WebSession $session

$tables | ConvertTo-Json
```

### 2. Test Staff API qua Gateway

```powershell
# Test Authentication - Login Staff
$staffLoginBody = @{
    tenDangNhap = "staff01"
    matKhau = "123456"
} | ConvertTo-Json

$staffLoginResponse = Invoke-RestMethod -Uri "http://localhost:5000/staff/api/Authentication/login" `
    -Method POST `
    -Body $staffLoginBody `
    -ContentType "application/json" `
    -SessionVariable staffSession

Write-Host "Staff Login Response:" -ForegroundColor Green
$staffLoginResponse | ConvertTo-Json

# Test Get All Tables (Staff)
Write-Host "`nGet All Tables (Staff):" -ForegroundColor Green
$staffTables = Invoke-RestMethod -Uri "http://localhost:5000/staff/api/Ban" `
    -Method GET `
    -WebSession $staffSession

$staffTables | ConvertTo-Json
```

### 3. So sánh Direct vs Gateway

```powershell
# Call tr?c ti?p Admin API
Write-Host "`nDirect Admin API Call:" -ForegroundColor Yellow
Measure-Command {
    $directResponse = Invoke-RestMethod -Uri "http://localhost:5092/api/Product/monan" -Method GET
} | Select-Object TotalMilliseconds

# Call qua Gateway
Write-Host "Gateway Call:" -ForegroundColor Yellow
Measure-Command {
    $gatewayResponse = Invoke-RestMethod -Uri "http://localhost:5000/admin/api/Product/monan" -Method GET
} | Select-Object TotalMilliseconds
```

### 4. Test Error Handling

```powershell
# Test v?i endpoint không t?n t?i
try {
    Write-Host "`nTest Invalid Endpoint:" -ForegroundColor Red
    Invoke-RestMethod -Uri "http://localhost:5000/admin/api/Invalid/endpoint" -Method GET
} catch {
    Write-Host "Error (Expected):" -ForegroundColor Yellow
    Write-Host $_.Exception.Message
}

# Test v?i method không ???c phép
try {
    Write-Host "`nTest Invalid Method:" -ForegroundColor Red
    Invoke-RestMethod -Uri "http://localhost:5000/admin/api/Product/monan" -Method DELETE
} catch {
    Write-Host "Error (Expected):" -ForegroundColor Yellow
    Write-Host $_.Exception.Message
}
```

## Automated Test Script

L?u script sau vào file `test-gateway.ps1`:

```powershell
# test-gateway.ps1
param(
    [string]$GatewayUrl = "http://localhost:5000",
    [string]$AdminUser = "admin",
    [string]$AdminPassword = "123456"
)

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "API Gateway Test Suite" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n[Test 1] Checking if Gateway is running..." -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri $GatewayUrl -Method GET -TimeoutSec 5
    Write-Host "? Gateway is running (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "? Gateway is not accessible" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Admin Login
Write-Host "`n[Test 2] Testing Admin Login..." -ForegroundColor Green
try {
    $loginBody = @{
        tenDangNhap = $AdminUser
        matKhau = $AdminPassword
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$GatewayUrl/admin/api/Authentication/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -SessionVariable session

    if ($loginResponse.success) {
        Write-Host "? Admin Login successful" -ForegroundColor Green
    } else {
        Write-Host "? Login failed: $($loginResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "? Login request failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get Products
Write-Host "`n[Test 3] Testing Get Products..." -ForegroundColor Green
try {
    $products = Invoke-RestMethod -Uri "$GatewayUrl/admin/api/Product/monan" `
        -Method GET `
        -WebSession $session

    Write-Host "? Retrieved $(@($products).Count) products" -ForegroundColor Green
} catch {
    Write-Host "? Failed to get products" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get Categories
Write-Host "`n[Test 4] Testing Get Categories..." -ForegroundColor Green
try {
    $categories = Invoke-RestMethod -Uri "$GatewayUrl/admin/api/Product/danhmuc" `
        -Method GET `
        -WebSession $session

    Write-Host "? Retrieved $(@($categories).Count) categories" -ForegroundColor Green
} catch {
    Write-Host "? Failed to get categories" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get Employees
Write-Host "`n[Test 5] Testing Get Employees..." -ForegroundColor Green
try {
    $employees = Invoke-RestMethod -Uri "$GatewayUrl/admin/api/Employees" `
        -Method GET `
        -WebSession $session

    Write-Host "? Retrieved $(@($employees).Count) employees" -ForegroundColor Green
} catch {
    Write-Host "? Failed to get employees" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Performance Test
Write-Host "`n[Test 6] Performance Test..." -ForegroundColor Green
Write-Host "Direct API Call:" -ForegroundColor Yellow
$directTime = Measure-Command {
    Invoke-RestMethod -Uri "http://localhost:5092/api/Product/monan" -Method GET
}
Write-Host "  Time: $($directTime.TotalMilliseconds)ms"

Write-Host "Gateway Call:" -ForegroundColor Yellow
$gatewayTime = Measure-Command {
    Invoke-RestMethod -Uri "$GatewayUrl/admin/api/Product/monan" -Method GET -WebSession $session
}
Write-Host "  Time: $($gatewayTime.TotalMilliseconds)ms"

$overhead = $gatewayTime.TotalMilliseconds - $directTime.TotalMilliseconds
Write-Host "  Gateway Overhead: $($overhead)ms" -ForegroundColor $(if ($overhead -lt 100) { "Green" } else { "Yellow" })

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Test Suite Completed" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
```

Ch?y script:
```powershell
.\test-gateway.ps1
```

Ho?c v?i custom parameters:
```powershell
.\test-gateway.ps1 -GatewayUrl "http://localhost:5000" -AdminUser "admin" -AdminPassword "123456"
```

## Bash Script (Linux/Mac)

L?u vào file `test-gateway.sh`:

```bash
#!/bin/bash

GATEWAY_URL="http://localhost:5000"
ADMIN_USER="admin"
ADMIN_PASSWORD="123456"

echo "=================================="
echo "API Gateway Test Suite"
echo "=================================="

# Test 1: Health Check
echo -e "\n[Test 1] Checking if Gateway is running..."
if curl -s -o /dev/null -w "%{http_code}" "$GATEWAY_URL" | grep -q "200\|404"; then
    echo "? Gateway is running"
else
    echo "? Gateway is not accessible"
    exit 1
fi

# Test 2: Admin Login
echo -e "\n[Test 2] Testing Admin Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/admin/api/Authentication/login" \
    -H "Content-Type: application/json" \
    -d "{\"tenDangNhap\":\"$ADMIN_USER\",\"matKhau\":\"$ADMIN_PASSWORD\"}" \
    -c cookies.txt)

if echo "$LOGIN_RESPONSE" | grep -q "success.*true"; then
    echo "? Admin Login successful"
else
    echo "? Login failed"
fi

# Test 3: Get Products
echo -e "\n[Test 3] Testing Get Products..."
PRODUCTS=$(curl -s -X GET "$GATEWAY_URL/admin/api/Product/monan" -b cookies.txt)
echo "? Retrieved products"

# Test 4: Get Categories
echo -e "\n[Test 4] Testing Get Categories..."
CATEGORIES=$(curl -s -X GET "$GATEWAY_URL/admin/api/Product/danhmuc" -b cookies.txt)
echo "? Retrieved categories"

echo -e "\n=================================="
echo "Test Suite Completed"
echo "=================================="

rm -f cookies.txt
```

Ch?y script:
```bash
chmod +x test-gateway.sh
./test-gateway.sh
```
