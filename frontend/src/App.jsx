// frontend/src/App.jsx
// Updated with Layout wrapper

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { MessageProvider } from "./context/MessageContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";

function App() {
  return (
    <AuthProvider>
      <MessageProvider>
        <BrowserRouter>
          {/* Layout wraps everything - header shows conditionally */}
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </MessageProvider>
    </AuthProvider>
  );
}

export default App;

// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
// import { MessageProvider } from "./context/MessageContext";
// import ProtectedRoute from "./components/ProtectedRoute";
// import Home from "./pages/Home";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import Profile from "./pages/Profile";
// import Messages from "./pages/Messages";

// function App() {
//   return (
//     <AuthProvider>
//       <MessageProvider>
//         <BrowserRouter>
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />
//             <Route
//               path="/profile"
//               element={
//                 <ProtectedRoute>
//                   <Profile />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/messages"
//               element={
//                 <ProtectedRoute>
//                   <Messages />
//                 </ProtectedRoute>
//               }
//             />
//             <Route path="*" element={<Navigate to="/" replace />} />
//           </Routes>
//         </BrowserRouter>
//       </MessageProvider>
//     </AuthProvider>
//   );
// }

// export default App;
