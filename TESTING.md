# Testing Documentation

## 1. Testing Overview

The Customer Loyalty Rewards System will be tested throughout development to verify that its features work correctly, securely and consistently.

Testing will be performed incrementally as individual modules are implemented.

The initial testing approach will include:

- Manual functional testing.
- Input validation testing.
- Authentication and authorization testing.
- Security and fraud-prevention testing.
- Database consistency testing.
- Integration testing.
- Error-handling testing.

## 2. Testing Environment

| Component | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js and Express.js |
| Database | MongoDB Community |
| API Testing | Postman |
| Browser Testing | Web browser |
| Version Control | Git and GitHub |

Testing will use separate test accounts for customers, administrators and staff.

Test product codes will be generated through the application's code-generation functionality.

## 3. Planned Functional Test Cases

### 3.1 Customer Registration and Authentication

| Test ID | Test Scenario | Expected Result |
|---|---|---|
| TC-01 | Register with valid information | Account created successfully |
| TC-02 | Register with an existing email | Registration rejected |
| TC-03 | Register with an existing username | Registration rejected |
| TC-04 | Submit an empty registration form | Validation errors displayed |
| TC-05 | Enter incorrect login credentials | Login rejected |
| TC-06 | Enter incorrect credentials five consecutive times | Temporary account lockout |
| TC-07 | Request password reset | Appropriate recovery response displayed |
| TC-08 | Use an expired or previously used reset token | Password reset rejected |

### 3.2 Product and Reward Code Management

| Test ID | Test Scenario | Expected Result |
|---|---|---|
| TC-09 | Generate a batch of product codes | Unique codes generated |
| TC-10 | Generate codes for an inactive product | Operation rejected |
| TC-11 | Export codes in CSV format | Valid CSV file downloaded |
| TC-12 | Export codes in Excel format | Valid Excel file downloaded |
| TC-13 | Deactivate an unused code | Code becomes unavailable |
| TC-14 | Deactivate a batch | All eligible unused codes deactivated |
| TC-15 | Attempt to deactivate an already claimed code | Operation rejected |
| TC-16 | Change a product's points value | Previously generated codes retain their original points |

### 3.3 Customer Points and Code Claiming

| Test ID | Test Scenario | Expected Result |
|---|---|---|
| TC-17 | Claim a valid product code | Points credited successfully |
| TC-18 | Claim an already claimed code | Duplicate claim rejected |
| TC-19 | Enter an invalid code | Claim rejected |
| TC-20 | Enter a deactivated code | Claim rejected |
| TC-21 | Submit an empty code | Validation error displayed |
| TC-22 | Enter five consecutive invalid codes | Suspicious activity alert generated |
| TC-23 | Claim a valid code after invalid attempts | Claim succeeds and consecutive failure counter resets |
| TC-24 | Attempt to modify points from the frontend | Backend rejects unauthorised modification |

### 3.4 Points Transaction History

| Test ID | Test Scenario | Expected Result |
|---|---|---|
| TC-25 | Successfully claim a code | Earned transaction recorded |
| TC-26 | Redeem a reward | Redeemed transaction recorded |
| TC-27 | Receive a refund | Refund transaction recorded |
| TC-28 | Administrator adjusts points | Adjustment transaction records the reason and administrator |
| TC-29 | Attempt to deduct more points than available | Operation rejected |
| TC-30 | View transaction history | Correct transaction details and balance displayed |

### 3.5 Reward Redemption and Collection

| Test ID | Test Scenario | Expected Result |
|---|---|---|
| TC-31 | Redeem a reward with sufficient points | Redemption created successfully |
| TC-32 | Redeem without sufficient points | Redemption rejected |
| TC-33 | Redeem below the minimum threshold | Redemption rejected |
| TC-34 | Redeem an inactive reward | Redemption rejected |
| TC-35 | Redeem a reward with zero stock | Redemption rejected |
| TC-36 | Staff verifies a valid redemption code | Collection can be confirmed |
| TC-37 | Attempt to reuse a collected redemption code | Verification rejected |
| TC-38 | Cancel an active redemption | Points refunded and stock restored |
| TC-39 | Allow an active redemption to expire | Points refunded and stock restored |
| TC-40 | Attempt to cancel a collected redemption | Cancellation rejected |

### 3.6 Role-Based Access Control

| Test ID | Test Scenario | Expected Result |
|---|---|---|
| TC-41 | Customer accesses an admin-only API | Access denied |
| TC-42 | Staff attempts to generate product codes | Access denied |
| TC-43 | Staff attempts to adjust customer points | Access denied |
| TC-44 | Unauthenticated user accesses a protected API | Access denied |
| TC-45 | Administrator manages staff accounts | Operation succeeds |

### 3.7 Notifications and Reports

| Test ID | Test Scenario | Expected Result |
|---|---|---|
| TC-46 | Successfully claim a code | Customer receives an in-app notification |
| TC-47 | Successfully redeem a reward | Customer receives an in-app notification |
| TC-48 | Redemption approaches expiry | Reminder generated seven days before expiry |
| TC-49 | Customer marks a notification as read | Notification status updated |
| TC-50 | Administrator exports a report | Correct report file generated |

## 4. Security Testing

The following security checks will be performed:

- Verify that passwords are never stored in plain text.
- Verify authentication and authorization for protected APIs.
- Verify that customers cannot manipulate points balances.
- Verify that product codes cannot be claimed more than once.
- Verify that redemption codes cannot be reused.
- Verify temporary login lockouts.
- Verify suspicious activity detection.
- Verify that staff cannot access administrative functions.
- Verify that sensitive configuration values are not exposed in source code.

## 5. Database Consistency Testing

The following scenarios will be tested:

1. Product code status and customer points must update consistently after a successful claim.
2. Every points balance change must have a corresponding transaction record.
3. Reward redemption must update points and stock consistently.
4. Cancellation and expiry must not produce duplicate refunds.
5. A collected reward must not be refunded automatically.
6. Concurrent requests must not allow duplicate claims or reward overselling.

## 6. Testing Results

Actual test results, including pass/fail status, observations and corrections, will be recorded as development progresses.

| Test ID | Result | Remarks |
|---|---|---|
| Pending | Not executed | Testing will begin after implementation |

## 7. Conclusion

Testing will help ensure that the Customer Loyalty Rewards System performs its intended operations while maintaining data consistency, security and reliability.

The final testing results will be updated after implementation and execution of the test cases.