# Bulk Email Feature - Implementation Guide

## Overview
This feature allows HR to send verification emails to employees in bulk, with special filtering for employees with ID length ≥ 10 digits.

---

## Features Implemented

### 1. **Select All Button**
- Toggles selection of all filtered employees
- Shows "Select All" or "Deselect All" based on current state
- Works with search filters

### 2. **Bulk Send All Button**
- Opens bulk email sender modal
- Sends emails to all filtered employees
- Processes in batches of 50

### 3. **ID ≥10 Filter Button**
- Filters employees with ID length ≥ 10 digits
- Shows count of matching employees
- Opens bulk sender with filtered list

### 4. **BulkEmailSender Component**
- Separate modal component for bulk operations
- Real-time progress tracking
- Batch processing with 1-second delay between batches
- Success/failure counting
- Cannot be closed during sending

---

## Architecture

### Component Structure
```
SearchEmp.tsx (Main Component)
├── State Management
│   ├── showBulkSender: boolean
│   ├── bulkFilterType: 'all' | 'id10plus'
│   └── employeesWithLongId: computed array
│
└── BulkEmailSender.tsx (Modal Component)
    ├── Props
    │   ├── employees: Employee[]
    │   ├── onClose: () => void
    │   └── filterType: 'all' | 'id10plus'
    │
    └── State
        ├── sending: boolean
        ├── progress: number (0-100)
        ├── successCount: number
        ├── failCount: number
        ├── currentBatch: number
        └── totalBatches: number
```

---

## How It Works

### Batch Processing Logic

```typescript
const BATCH_SIZE = 50; // Configurable

// Split employees into batches
const batches = Math.ceil(employees.length / BATCH_SIZE);

// Process each batch
for (let i = 0; i < batches; i++) {
  const batch = employees.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
  
  // Send batch
  await axios.post('/api/send-email', { employees: batch });
  
  // Update progress
  setProgress(((i + 1) / batches) * 100);
  
  // Delay between batches (prevent server overload)
  await new Promise(resolve => setTimeout(resolve, 1000));
}
```

### ID Length Filtering

```typescript
// Filter employees with ID >= 10 digits
const employeesWithLongId = allEmployees.filter(emp => emp.id.length >= 10);
```

---

## UI Components

### 1. Action Buttons Bar
Located below the employee count display:

```tsx
<div className="flex gap-2">
  {/* Select All Button */}
  <button onClick={handleSelectAll}>
    {isAllSelected ? 'Deselect All' : 'Select All'}
  </button>
  
  {/* Bulk Send All */}
  <button onClick={() => openBulkSender('all')}>
    Bulk Send All ({totalCount})
  </button>
  
  {/* ID ≥10 Filter */}
  <button onClick={() => openBulkSender('id10plus')}>
    ID ≥10 ({longIdCount})
  </button>
</div>
```

### 2. Bulk Email Sender Modal

**Header:**
- Title: "Bulk Email Sender"
- Close button (disabled during sending)

**Stats Section:**
- Total employees count
- Batch size (50)
- Filter type indicator

**Progress Section:**
- Progress bar (0-100%)
- Current batch / Total batches
- Success count
- Failure count

**Warning Section:**
- Important notes about the process
- Do not close warning

**Action Buttons:**
- Send button (shows loader during sending)
- Cancel button (disabled during sending)

---

## API Integration

### Backend Endpoint
```
POST /api/send-email
```

### Request Format
```json
{
  "employees": [
    {
      "id": "1234567890",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
```

### Response Handling
- Success: Continue to next batch
- Failure: Log error, increment fail count, continue

---

## Performance Considerations

### For 9,000 Employees

**Batch Configuration:**
- Batch size: 50 emails
- Total batches: 180
- Delay between batches: 1 second
- Estimated time: ~3 minutes

**Memory Management:**
- Only render 200 employees at a time in list
- Use virtual scrolling for large lists
- Process batches sequentially (not parallel)

**Error Handling:**
- Continue processing even if batches fail
- Track success/failure counts
- Show final summary

---

## User Flow

### Scenario 1: Send to All Employees
1. HR opens dashboard
2. Clicks "Bulk Send All" button
3. Modal opens showing total count
4. Clicks "Send" button
5. Progress bar shows real-time progress
6. Success/failure counts update
7. Completion toast notification
8. Modal can be closed

### Scenario 2: Send to ID ≥10 Only
1. HR opens dashboard
2. Clicks "ID ≥10" button
3. Modal opens with filtered count
4. Shows "ID Length ≥ 10 digits" indicator
5. Clicks "Send" button
6. Same progress flow as Scenario 1

### Scenario 3: Select All + Individual Send
1. HR clicks "Select All" button
2. All visible employees selected
3. Can deselect individuals
4. Clicks "Send Registration Emails" in right panel
5. Standard email sending (not batched)

---

## Code Files Modified

### 1. SearchEmp.tsx
**Changes:**
- Added `BulkEmailSender` import
- Added state: `showBulkSender`, `bulkFilterType`
- Added computed: `employeesWithLongId`
- Added buttons: Select All, Bulk Send All, ID ≥10
- Added modal rendering

### 2. BulkEmailSender.tsx (New)
**Features:**
- Modal component
- Batch processing logic
- Progress tracking
- Success/failure counting
- Real-time UI updates

---

## Configuration Options

### Adjustable Parameters

```typescript
// In BulkEmailSender.tsx
const BATCH_SIZE = 50;           // Emails per batch
const DELAY_MS = 1000;           // Delay between batches
const ID_LENGTH_THRESHOLD = 10;  // Minimum ID length for filter
```

### Environment Variables
```env
VITE_BACKEND_URL=http://localhost:5000
```

---

## Testing Checklist

- [ ] Select All button toggles correctly
- [ ] Deselect All works
- [ ] Bulk Send All opens modal with correct count
- [ ] ID ≥10 filter shows correct count
- [ ] Progress bar updates smoothly
- [ ] Success/failure counts are accurate
- [ ] Modal cannot be closed during sending
- [ ] Toast notifications appear
- [ ] Works with 9,000+ employees
- [ ] Search filter + Select All works
- [ ] Batch processing completes successfully
- [ ] Error handling works (network failures)

---

## Future Enhancements

1. **Pause/Resume Functionality**
   - Allow pausing batch processing
   - Resume from last batch

2. **Custom Batch Size**
   - Let HR configure batch size
   - Adjust based on server capacity

3. **Scheduling**
   - Schedule bulk emails for later
   - Recurring bulk sends

4. **Advanced Filters**
   - Multiple ID length ranges
   - Department-based filtering
   - Date-based filtering

5. **Export Functionality**
   - Export filtered employee list
   - Download success/failure report

6. **Retry Failed Batches**
   - Automatically retry failed batches
   - Manual retry option

---

## Troubleshooting

### Issue: Modal doesn't open
**Solution:** Check console for errors, verify BulkEmailSender import

### Issue: Progress stuck at 0%
**Solution:** Check API endpoint, verify network connection

### Issue: All batches failing
**Solution:** Check backend logs, verify email service configuration

### Issue: Count mismatch
**Solution:** Verify filter logic, check employee data structure

### Issue: Browser freezes with large lists
**Solution:** Reduce BATCH_SIZE, increase DELAY_MS

---

## Security Considerations

1. **Rate Limiting:** Backend should implement rate limiting
2. **Authentication:** Verify HR user permissions
3. **Email Validation:** Validate email addresses before sending
4. **Logging:** Log all bulk operations for audit trail
5. **Timeout:** Implement request timeouts

---

## Summary

This implementation provides a robust, scalable solution for sending bulk verification emails to thousands of employees. The batch processing approach prevents server overload, while the progress tracking keeps HR informed. The ID length filter adds flexibility for targeting specific employee groups.

**Key Benefits:**
✅ Handles 9,000+ employees efficiently
✅ Real-time progress tracking
✅ Error resilience (continues on failures)
✅ User-friendly interface
✅ Flexible filtering options
✅ Minimal server load
