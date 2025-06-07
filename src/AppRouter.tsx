// src/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import LibraryPage from "./pages/LibraryPage";
import ResultPage from "./pages/ResultPage";
import SettingsPage from "./pages/SettingsPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="library" element={<LibraryPage />} />
          <Route path="result" element={<ResultPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
