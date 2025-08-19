# WatchStore - Full-Stack Application

Ứng dụng thương mại điện tử bán đồng hồ với React.js frontend và Node.js backend.

## 🚀 Tính năng

### Frontend (React.js)
- ✅ Giao diện responsive hiện đại
- ✅ Authentication với JWT tokens
- ✅ Shopping cart functionality
- ✅ Product search và filtering
- ✅ User profile management

### Backend (Node.js + Express)
- ✅ RESTful API
- ✅ JWT Authentication
- ✅ Password hashing với bcrypt
- ✅ CORS enabled
- ✅ Input validation

## 🛠️ Cài đặt

### Cài đặt dependencies
```bash
# Cài đặt dependencies cho frontend
npm install

# Cài đặt dependencies cho backend
cd backend
npm install
```

## 🚦 Chạy ứng dụng

### Chạy riêng lẻ

#### Backend Server (Port 5000)
```bash
cd backend
npm start
```

#### Frontend (Port 3001)
```bash
npm start
```

### Chạy đồng thời
```bash
# Cài đặt concurrently (chỉ cần 1 lần)
npm install -g concurrently

# Chạy cả frontend và backend
npx concurrently "cd backend && npm start" "npm start"
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Users
- `GET /api/users` - Lấy danh sách users (cần token)

### Health Check
- `GET /api/health` - Kiểm tra trạng thái server

## 🔐 Authentication Flow

1. **Đăng ký/Đăng nhập**: Client gửi thông tin → Server xác thực → Trả về JWT token
2. **Lưu token**: Token được lưu vào localStorage
3. **API calls**: Token được gửi trong header `Authorization: Bearer <token>`
4. **Đăng xuất**: Xóa token khỏi localStorage

## 🗄️ Cấu trúc dữ liệu

### User Object
```javascript
{
  id: number,
  name: string,
  email: string,
  password: string (hashed),
  createdAt: string (ISO date),
  avatar: string (URL)
}
```

## 🔧 Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=WatchStore
```

### Backend (backend/.env)
```
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

## 🚨 Bảo mật

- ✅ Passwords được hash với bcrypt
- ✅ JWT tokens có thời hạn (7 ngày)
- ✅ Input validation
- ✅ CORS configured

## 📁 Cấu trúc thư mục

```
watch-store/
├── src/                    # Frontend React code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── context/           # React Context
│   ├── services/          # API services
│   └── data/              # Static data
├── backend/               # Backend Node.js code
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── .env              # Backend environment variables
├── public/               # Static assets
└── package.json         # Frontend dependencies
```

## 🔄 Migration từ localStorage

Ứng dụng đã được nâng cấp từ localStorage sang backend API:

**Trước**: Dữ liệu lưu trong browser localStorage
**Sau**: Dữ liệu lưu trên server với database (hiện tại in-memory)

## 🚀 Triển khai Production

### Frontend
- Build: `npm run build`
- Deploy: Vercel, Netlify, hoặc web server

### Backend
- Deploy: Heroku, Railway, DigitalOcean, AWS
- Database: MongoDB, PostgreSQL, MySQL
- Environment: Đảm bảo set đúng JWT_SECRET

## 🐛 Debugging

### Kiểm tra kết nối
1. Mở `http://localhost:5000/api/health` - Backend health check
2. Mở `http://localhost:3001` - Frontend
3. Kiểm tra Console/Network tab trong DevTools

### Common Issues
- **CORS Error**: Đảm bảo backend đang chạy
- **Token Invalid**: Xóa localStorage và đăng nhập lại
- **Port conflicts**: Thay đổi port trong .env files

## 📞 Support

Nếu có vấn đề, hãy kiểm tra:
1. Backend server đang chạy (port 5000)
2. Frontend đang chạy (port 3001)
3. Network tab trong DevTools để xem API calls
4. Console errors trong DevTools
