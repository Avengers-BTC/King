# 📱 Mobile Testing Guide for NightVibe

## 🎯 **Test Areas Overview**

### **Authentication Flow**
- [ ] **Login Page** - Email/password input, Google sign-in
- [ ] **Regular Signup** - User registration flow
- [ ] **DJ Signup** - Two-step DJ profile creation
- [ ] **Session Management** - Proper redirects and role detection

### **Core Features**
- [ ] **Profile Management** - Edit profile, upload profile pictures
- [ ] **Moments** - Upload and view moments
- [ ] **DJ Dashboard** - Stats, profile, events management
- [ ] **Account Deletion** - Complete deletion flow

---

## 📲 **Mobile Testing Checklist**

### **🔐 Authentication Tests**

#### **Login Flow**
1. **Touch Targets**
   - [ ] Email input - properly sized (minimum 44px)
   - [ ] Password input - show/hide password button works
   - [ ] Login button - easy to tap
   - [ ] Google button - accessible size

2. **Form Behavior**
   - [ ] Inputs don't cause zoom on iOS (16px font size)
   - [ ] Keyboard pushes content up properly
   - [ ] Form validation messages visible
   - [ ] Loading states clear

#### **DJ Signup Flow**
1. **Step 1 - Account Creation**
   - [ ] All form fields properly sized
   - [ ] Password validation works
   - [ ] Step progression smooth

2. **Step 2 - DJ Profile**
   - [ ] Genre selection dropdown works
   - [ ] Text areas properly sized
   - [ ] Social media inputs functional
   - [ ] Submit button accessible

3. **Error Handling**
   - [ ] Network errors displayed properly
   - [ ] Validation errors clear
   - [ ] Retry mechanisms work

### **📱 Core App Features**

#### **Profile Page**
1. **Layout**
   - [ ] Profile picture upload area touch-friendly
   - [ ] Edit mode toggles properly
   - [ ] Stats cards readable on mobile
   - [ ] Action buttons accessible

2. **Profile Picture Upload**
   - [ ] Drag and drop works on mobile
   - [ ] Camera button triggers file picker
   - [ ] Preview displays correctly
   - [ ] Upload progress visible

#### **Moments**
1. **Upload Page**
   - [ ] Image selection works
   - [ ] Caption input properly sized
   - [ ] Upload button accessible
   - [ ] Progress indicators visible

2. **Moments Feed**
   - [ ] Images display properly
   - [ ] Grid layout responsive
   - [ ] Like/comment buttons accessible
   - [ ] Infinite scroll (if implemented)

#### **DJ Dashboard**
1. **Navigation**
   - [ ] Tab navigation touch-friendly
   - [ ] Stats cards properly sized
   - [ ] Quick action buttons accessible

2. **Profile Tab**
   - [ ] Information cards readable
   - [ ] Edit buttons properly sized
   - [ ] Social media links work
   - [ ] Danger zone clearly marked

### **🗑️ Account Deletion**

#### **Deletion Modal**
1. **Accessibility**
   - [ ] Modal displays properly on mobile
   - [ ] Confirmation input accessible
   - [ ] Warning text readable
   - [ ] Buttons properly sized

2. **Flow**
   - [ ] Confirmation phrase input works
   - [ ] Deletion process feedback clear
   - [ ] Redirect after deletion works

---

## 🔧 **Technical Testing**

### **Performance**
- [ ] **Touch Response** - All buttons respond within 100ms
- [ ] **Loading States** - Clear feedback during operations
- [ ] **Image Loading** - Progressive loading for moments
- [ ] **Smooth Animations** - 60fps transitions

### **Responsive Design**
- [ ] **320px Width** - iPhone SE compatibility
- [ ] **768px Width** - Tablet portrait mode
- [ ] **1024px Width** - Tablet landscape mode
- [ ] **Safe Areas** - Respects device notches/home indicators

### **Touch Interactions**
- [ ] **Minimum Touch Targets** - 44px minimum
- [ ] **Touch Feedback** - Visual response to taps
- [ ] **Gesture Support** - Swipe, pinch where appropriate
- [ ] **Accessibility** - Screen reader compatible

---

## 🐛 **Common Issues to Check**

### **iOS Specific**
- [ ] **Zoom Prevention** - Inputs have 16px+ font size
- [ ] **Safe Area** - Content respects notches
- [ ] **Viewport Issues** - No horizontal scroll
- [ ] **Touch Delays** - No 300ms touch delay

### **Android Specific**
- [ ] **Back Button** - Proper navigation handling
- [ ] **Keyboard Overlap** - Content adjusts properly
- [ ] **Chrome Autofill** - Doesn't break layout
- [ ] **Material Design** - Follows guidelines

---

## 🛠️ **DJ Auth Flow Debug Steps**

### **If DJ Signup Fails:**

1. **Check Browser Console**
   ```javascript
   // Look for these log messages:
   [DJ Signup] Attempting to sign in with credentials...
   [DJ Signup] Sign in result: {...}
   [DJ API] DJ profile created successfully for user: ...
   ```

2. **Common Issues**
   - Email already exists
   - Password validation failure
   - Network connectivity
   - Database transaction failure

3. **Manual Testing Steps**
   - Try regular user signup first
   - Check if username is unique
   - Verify password meets requirements
   - Test on different networks

### **If Session Issues Occur:**
1. Clear browser storage
2. Check NextAuth.js configuration
3. Verify role assignment
4. Test redirect URLs

---

## 📋 **Device Testing Matrix**

### **Primary Devices**
- [ ] **iPhone SE** (320px) - iOS Safari
- [ ] **iPhone 12/13** (390px) - iOS Safari
- [ ] **Samsung Galaxy S21** (360px) - Chrome Android
- [ ] **iPad** (768px) - iOS Safari

### **Secondary Devices**
- [ ] **iPhone 14 Pro Max** (430px) - iOS Safari
- [ ] **Google Pixel 6** (393px) - Chrome Android
- [ ] **Samsung Galaxy Tab** (800px) - Chrome Android

---

## ✅ **Sign-off Checklist**

### **Before Production Deployment:**
- [ ] All authentication flows tested
- [ ] Profile management functional
- [ ] Image uploads working
- [ ] DJ features accessible
- [ ] Account deletion safe
- [ ] Performance optimized
- [ ] Accessibility compliant
- [ ] Cross-browser compatible

### **Post-Deployment Verification:**
- [ ] Production URLs work
- [ ] Vercel blob storage functional
- [ ] Database connections stable
- [ ] Session management working
- [ ] Error tracking active

---

## 🚀 **Quick Mobile Test Commands**

```bash
# Start development server
npm run dev

# Test on local network (mobile device)
npm run dev -- --host 0.0.0.0

# Check lighthouse mobile score
npx lighthouse http://localhost:3000 --preset=mobile

# Test PWA functionality
npx lighthouse http://localhost:3000 --preset=pwa
```

---

## 📞 **Support Contacts**

- **Developer Issues**: Check console logs and network tab
- **Design Issues**: Verify responsive breakpoints
- **Performance Issues**: Use Chrome DevTools mobile simulation
- **Accessibility Issues**: Test with screen reader

---

*Test thoroughly and ensure all features work seamlessly on mobile devices! 📱✨* 