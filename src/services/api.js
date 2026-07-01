const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateFileId = () => 'file_' + Math.random().toString(36).substr(2, 9);
const generateToken = () => 'mock_jwt_' + Math.random().toString(36).substr(2, 15);

// ==================== Mock User ====================
const mockUser = {
  id: '1',
  fullName: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=2563eb&color=fff',
  bio: 'Product designer and document sharing enthusiast.',
  plan: 'pro',
  subscriptionStatus: 'active',
  createdAt: '2024-01-15',
  notifications: {
    emailNotifications: true,
    uploadSuccess: true,
    shareNotifications: true,
    monthlyReports: false,
  },
  apiKey: 'sk_live_' + Math.random().toString(36).substr(2, 20),
};

// ==================== PDF Generator (creates a valid PDF) ====================
const createMockPDF = () => {
  // Minimal valid PDF with "Hello World" content
  const pdfBase64 = 'JVBERi0xLjQKMSAwIG9iago8PAovVGl0bGUgKENyZWF0ZWQgV2l0aCBEb2NTaGFyZSkKL1Byb2R1Y2VyIChEb2NTaGFyZSBQcm8pCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL1Jlc291cmNlcyA0IDAgUgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1Byb2NTZXQgWy9QREYgL1RleHRdCi9Gb250IDw8Ci9GMSA2IDAgUgo+Pgo+PgplbmRvYmoKNSAwIG9iago8PAovTGVuZ3RoIDUwCj4+CnN0cmVhbQpCVAovRjEgMTAgVGYKMSAwIDAgMSAwIDUwIDc0MCBUbShIZWxsbyBXb3JsZCEpCkVUCmVuZHN0cmVhbQplbmRvYmoKNiAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL05hbWUgL0YxCi9CYXNlRm9udCAvSGVsdmV0aWNhCi9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nCj4+CmVuZG9iagp4cmVmCjAgNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDAgMDAwMDAgbiAKMDAwMDAwMDA3OSAwMDAwMCBuIAowMDAwMDAwMDQ5IDAwMDAwIG4gCjAwMDAwMDAxMjUgMDAwMDAgbiAKMDAwMDAwMDE5MCAwMDAwMCBuIAowMDAwMDAwMjg5IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNwovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMzU5CiUlRU9G';

  const binaryString = atob(pdfBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// ==================== Mock Files with Actual Content ====================
const generateMockFiles = (count = 25) => {
  const types = [
    { mime: 'application/pdf', ext: 'pdf', name: 'Annual_Report_2024' },
    { mime: 'image/jpeg', ext: 'jpg', name: 'Product_Photo' },
    { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: 'docx', name: 'Project_Proposal' },
    { mime: 'image/png', ext: 'png', name: 'Design_Mockup' },
    { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: 'xlsx', name: 'Financial_Spreadsheet' },
    { mime: 'video/mp4', ext: 'mp4', name: 'Demo_Video' },
    { mime: 'text/plain', ext: 'txt', name: 'README' },
  ];

  // Create a sample PDF for testing
  const samplePdfData = createMockPDF();
  const samplePdfBase64 = btoa(String.fromCharCode(...samplePdfData));

  return Array.from({ length: count }, (_, i) => {
    const typeInfo = types[Math.floor(Math.random() * types.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

    // For the first file (index 0), make it a PDF with actual content
    if (i === 0) {
      return {
        id: 'file_123',
        name: 'GES-2026-KOFI.pdf',
        size: 238920,
        type: 'application/pdf',
        pages: 3,
        uploadDate: date.toISOString(),
        views: Math.floor(Math.random() * 100),
        status: 'active',
        shareableLink: 'http://localhost:5173/view/file_123',
        expiresAt: null,
        uploader: mockUser.fullName,
        requirePassword: false,
        fileData: samplePdfBase64, // Base64 encoded PDF
        content: samplePdfBase64, // Also provide content field for compatibility
      };
    }

    // For other files
    const fileId = generateFileId();
    return {
      id: fileId,
      name: `${typeInfo.name}_${i + 1}.${typeInfo.ext}`,
      size: Math.floor(Math.random() * 50000000) + 10000,
      type: typeInfo.mime,
      uploadDate: date.toISOString(),
      views: Math.floor(Math.random() * 500),
      status: Math.random() > 0.1 ? 'active' : 'expired',
      shareableLink: `http://localhost:5173/view/${fileId}`,
      expiresAt: Math.random() > 0.7 ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
      uploader: mockUser.fullName,
      requirePassword: Math.random() > 0.8, // 20% of files are password protected
      password: Math.random() > 0.8 ? '123456' : null, // Some files have a password
      // Add content for text files
      ...(typeInfo.mime === 'text/plain' && {
        content: 'This is a sample text file content.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\nSed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
      }),
      // For image files, add a placeholder
      ...(typeInfo.mime.startsWith('image/') && {
        content: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      }),
    };
  });
};

let mockFiles = generateMockFiles(30);

// ==================== Mock Invoices ====================
const mockInvoices = [
  { id: 'INV-2024-001', date: '2024-06-01', amount: 20.00, status: 'paid', plan: 'Pro' },
  { id: 'INV-2024-002', date: '2024-05-01', amount: 20.00, status: 'paid', plan: 'Pro' },
  { id: 'INV-2024-003', date: '2024-04-01', amount: 20.00, status: 'paid', plan: 'Pro' },
  { id: 'INV-2024-004', date: '2024-03-01', amount: 20.00, status: 'paid', plan: 'Pro' },
  { id: 'INV-2024-005', date: '2024-02-01', amount: 0.00, status: 'paid', plan: 'Free' },
];

// ==================== Auth APIs ====================
export const mockLogin = async (email, password) => {
  await delay(800);
  // Allow specific test credentials
  const validEmails = ['john@example.com', 'test12@gmail.com'];
  if (validEmails.includes(email) && password === 'password123') {
    return {
      success: true,
      data: { ...mockUser, token: generateToken() },
      message: 'Login successful',
    };
  }
  if (validEmails.includes(email) && password === '1234567890') {
    return {
      success: true,
      data: { ...mockUser, token: generateToken() },
      message: 'Login successful',
    };
  }
  if (password.length < 6) {
    throw new Error('Invalid email or password');
  }
  return {
    success: true,
    data: { ...mockUser, email, token: generateToken() },
    message: 'Login successful',
  };
};

export const mockRegister = async (userData) => {
  await delay(1000);
  return {
    success: true,
    data: { ...mockUser, ...userData, token: generateToken() },
    message: 'Registration successful. Please check your email to confirm your account.',
  };
};

export const mockForgotPassword = async (email) => {
  await delay(600);
  return {
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.',
  };
};

export const mockResetPassword = async (token, password) => {
  await delay(800);
  return {
    success: true,
    message: 'Password has been reset successfully.',
  };
};

export const mockConfirmEmail = async (token) => {
  await delay(500);
  return {
    success: true,
    message: 'Email confirmed successfully.',
  };
};

// ==================== File APIs ====================
export const mockUploadFile = async (formData) => {
  await delay(1500);
  
  const file = formData.get('file');
  const fileName = formData.get('fileName') || 'uploaded_file.pdf';
  const fileSize = parseInt(formData.get('fileSize')) || 2500000;
  const requirePassword = formData.get('requirePassword') === 'true';
  const password = formData.get('password') || null;
  const generateQR = formData.get('generateQR') === 'true';
  const setExpiry = formData.get('setExpiry') === 'true';
  const expiresAt = formData.get('expiresAt') || null;
  
  // Read the file and convert to base64 if it's a File object
  let fileData = null;
  let fileContent = null;
  let fileType = file?.type || 'application/pdf';
  
  if (file && file instanceof File) {
    // Read file as base64
    const reader = new FileReader();
    const base64Data = await new Promise((resolve, reject) => {
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          // Remove data URL prefix (e.g., "data:application/pdf;base64,")
          const base64 = result.split(',')[1] || result;
          resolve(base64);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    fileData = base64Data;
    fileContent = base64Data;
  }

  const newFile = {
    id: generateFileId(),
    name: fileName,
    size: fileSize,
    type: fileType,
    uploadDate: new Date().toISOString(),
    views: 0,
    status: 'active',
    shareableLink: `http://localhost:5173/view/${generateFileId()}`,
    expiresAt: setExpiry ? expiresAt : null,
    uploader: mockUser.fullName,
    requirePassword: requirePassword,
    password: requirePassword ? password : null,
    fileData: fileData,
    content: fileContent,
    pages: fileType === 'application/pdf' ? 3 : null,
    qrCodeGenerated: generateQR,
  };
  
  mockFiles.unshift(newFile);
  return {
    success: true,
    data: newFile,
    message: 'File uploaded successfully',
  };
};

export const mockGetFiles = async ({ page = 1, limit = 10, search = '', filter = 'all', sort = 'date-desc' } = {}) => {
  await delay(400);
  let filtered = [...mockFiles];

  if (search) {
    filtered = filtered.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  }
  if (filter !== 'all') {
    filtered = filtered.filter(f => f.status === filter);
  }

  // Sort
  switch (sort) {
    case 'date-asc':
      filtered.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
      break;
    case 'date-desc':
      filtered.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
      break;
    case 'name-asc':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'size-asc':
      filtered.sort((a, b) => a.size - b.size);
      break;
    case 'size-desc':
      filtered.sort((a, b) => b.size - a.size);
      break;
    default:
      filtered.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return {
    success: true,
    data: {
      files: paginated,
      total,
      page,
      totalPages,
      totalItems: total,
      totalSize: mockFiles.reduce((acc, f) => acc + f.size, 0),
      totalViews: mockFiles.reduce((acc, f) => acc + f.views, 0),
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
    message: 'Files retrieved successfully',
  };
};

export const mockGetFile = async (fileId) => {
  await delay(300);
  const file = mockFiles.find(f => f.id === fileId);
  if (!file) {
    throw new Error('File not found');
  }
  
  // If the file has a password, check if it's provided in the request
  // In a real app, you'd check a password header or body
  // For mock, we just return the file with the password field
  
  return {
    success: true,
    data: {
      ...file,
      // If file has requirePassword true, the viewer should prompt for password
      requirePassword: file.requirePassword || false,
    },
    message: 'File retrieved successfully',
  };
};

export const mockDeleteFile = async (fileId) => {
  await delay(500);
  mockFiles = mockFiles.filter(f => f.id !== fileId);
  return {
    success: true,
    message: 'File deleted successfully',
  };
};

export const mockVerifyPassword = async (fileId, password) => {
  await delay(400);
  const file = mockFiles.find(f => f.id === fileId);
  if (!file) {
    throw new Error('File not found');
  }
  
  // Check if password matches
  if (file.password && file.password === password) {
    return {
      success: true,
      data: {
        fileData: file.fileData || file.content,
      },
      message: 'Password verified successfully',
    };
  }
  
  throw new Error('Incorrect password');
};

// ==================== Dashboard APIs ====================
export const mockGetStats = async () => {
  await delay(400);
  const totalUploads = mockFiles.length;
  const totalViews = mockFiles.reduce((acc, f) => acc + f.views, 0);
  const totalSize = mockFiles.reduce((acc, f) => acc + f.size, 0);
  const activeLinks = mockFiles.filter(f => f.status === 'active').length;
  
  return {
    success: true,
    data: {
      totalUploads,
      totalViews,
      storageUsed: parseFloat((totalSize / (1024 * 1024 * 1024)).toFixed(2)), // Convert to GB
      storageLimit: 10,
      activeLinks,
    },
    message: 'Stats retrieved successfully',
  };
};

export const mockGetRecentActivity = async () => {
  await delay(300);
  return {
    success: true,
    data: mockFiles.slice(0, 7).map(f => ({
      ...f,
      uploadedDate: f.uploadDate,
      description: f.requirePassword ? 'Uploaded a password-protected file' : 'Uploaded a new file',
      user: mockUser.fullName,
      type: 'upload',
      status: 'success',
    })),
    message: 'Recent activity retrieved',
  };
};

// ==================== User APIs ====================
export const mockUpdateProfile = async (data) => {
  await delay(600);
  return {
    success: true,
    data: { ...mockUser, ...data },
    message: 'Profile updated successfully',
  };
};

export const mockChangePassword = async (data) => {
  await delay(600);
  return {
    success: true,
    message: 'Password changed successfully',
  };
};

export const mockUpdatePreferences = async (data) => {
  await delay(400);
  return {
    success: true,
    data: { ...mockUser, ...data },
    message: 'Preferences updated successfully',
  };
};

export const mockGetNotifications = async () => {
  await delay(300);
  return {
    success: true,
    data: mockUser.notifications,
    message: 'Notifications retrieved',
  };
};

// ==================== Subscription APIs ====================
export const apiCreateSubscription = async (paymentData) => {
  const { planId, paymentMethod = 'stripe' } = paymentData;
  await delay(1500);
  
  let paymentResult = {};
  
  if (planId !== 'free') {
    if (paymentMethod === 'paystack') {
      paymentResult.reference = 'ps_' + Math.random().toString(36).substr(2, 15);
      paymentResult.authorizationUrl = `${process.env.FRONTEND_URL}/paystack-checkout?reference=${paymentResult.reference}`;
    } else {
      paymentResult.sessionUrl = `${process.env.FRONTEND_URL}/stripe-checkout?plan=${planId}`;
    }
  }
  
  return {
    success: true,
    data: {
      ...mockUser,
      plan: paymentData.planId,
      subscriptionStatus: planId === 'free' ? 'active' : 'trialing',
      subscriptionStartDate: new Date().toISOString(),
      ...paymentResult,
    },
    message: 'Subscription created successfully',
  };
};

export const mockCreateSubscription = async (paymentData) => {
  await delay(1500);
  return {
    success: true,
    data: {
      ...mockUser,
      plan: paymentData.planId,
      subscriptionStatus: 'active',
      subscriptionStartDate: new Date().toISOString(),
    },
    message: 'Subscription created successfully',
  };
};

export const mockGetSubscription = async () => {
  await delay(300);
  return {
    success: true,
    data: {
      plan: mockUser.plan,
      status: mockUser.subscriptionStatus,
      startDate: mockUser.createdAt,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usage: {
        uploads: mockFiles.length,
        storage: parseFloat((mockFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024 * 1024)).toFixed(2)),
        teamMembers: 1,
      },
    },
    message: 'Subscription details retrieved',
  };
};

export const mockGetInvoices = async () => {
  await delay(400);
  return {
    success: true,
    data: mockInvoices,
    message: 'Invoices retrieved',
  };
};