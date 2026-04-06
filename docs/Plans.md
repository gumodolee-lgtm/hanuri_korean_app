# Plan: AI Chat Screen UX Fix

## Summary
Remove redundant onContentSizeChange auto-scroll that interrupts user scrolling, and fix Android multiline send behavior.

## Requirements
- [ ] REQ-1: Remove `onContentSizeChange={scrollToBottom}` — handleSend already scrolls explicitly
- [ ] REQ-2: Fix Android Enter key on multiline input sending newline instead of message

## Acceptance Criteria
- [ ] AC-1: ScrollView no longer auto-jumps to bottom when user has manually scrolled up
- [ ] AC-2: `scrollToBottom` is still called after user sends a message and after AI replies
- [ ] AC-3: On Android, Enter key on the chat input sends the message (not inserts newline)

## Implementation Steps

### Phase 1: Remove onContentSizeChange
- Step 1.1: Remove `onContentSizeChange={scrollToBottom}` from the ScrollView → file: `hanuri/src/screens/ai-chat/AIChatScreen.tsx`

### Phase 2: Android Enter key fix
- Step 2.1: Add `blurOnSubmit={false}` and `onSubmitEditing` guard for Android on the TextInput — or replace `onSubmitEditing` with explicit send button only (simpler) → same file

## Files to Modify
| File | Action | Description |
|------|--------|-------------|
| `hanuri/src/screens/ai-chat/AIChatScreen.tsx` | Modify | Remove onContentSizeChange, fix Android Enter |

## Out of Scope
- Chat history persistence across sessions
- Typing indicator animation
- Message pagination / history limit
