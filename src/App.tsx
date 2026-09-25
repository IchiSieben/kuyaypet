import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DeviceFrame } from '@/shell/DeviceFrame';
import { AppLayout } from '@/shell/AppLayout';
import { RequireAuth } from '@/shell/RequireAuth';
import { Splash } from '@/screens/Splash';
import { Login } from '@/screens/auth/Login';
import { Register } from '@/screens/auth/Register';
import { Recover } from '@/screens/auth/Recover';
import { Onboarding } from '@/screens/Onboarding';
import { Discover } from '@/screens/Discover';
import { Browse } from '@/screens/Browse';
import { Matches } from '@/screens/Matches';
import { PetProfile } from '@/screens/PetProfile';
import { ChatList } from '@/screens/chat/ChatList';
import { ChatThreadScreen } from '@/screens/chat/ChatThread';
import { Coordinate } from '@/screens/Coordinate';
import { Profile } from '@/screens/Profile';
import { Favorites } from '@/screens/Favorites';
import { History } from '@/screens/History';
import { Guide } from '@/screens/Guide';
import { Notifications } from '@/screens/Notifications';
import { Credits } from '@/screens/Credits';
import { OwnerHome } from '@/screens/owner/OwnerHome';
import { AdminShell } from '@/screens/admin/AdminShell';
import { AdminDashboard } from '@/screens/admin/AdminDashboard';
import { AdminUsers } from '@/screens/admin/AdminUsers';
import { AdminUserDetail } from '@/screens/admin/AdminUserDetail';
import { AdminPublications } from '@/screens/admin/AdminPublications';
import { AdminPublicationDetail } from '@/screens/admin/AdminPublicationDetail';
import { AdminReports } from '@/screens/admin/AdminReports';
import { AdminReportDetail } from '@/screens/admin/AdminReportDetail';
import { NewPet } from '@/screens/owner/NewPet';
import { EditPet } from '@/screens/owner/EditPet';
import { AdopterProfileView } from '@/screens/AdopterProfileView';

export default function App() {
  return (
    <HashRouter>
      <DeviceFrame>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/recuperar" element={<Recover />} />
          <Route path="/creditos" element={<Credits />} />
          <Route path="/guia" element={<Guide />} />
          <Route element={<RequireAuth />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/mascota/:id" element={<PetProfile />} />
            <Route path="/chats/:id" element={<ChatThreadScreen />} />
            <Route path="/coordinar/:petId" element={<Coordinate />} />
            <Route path="/responsable/nueva" element={<NewPet />} />
            <Route path="/responsable/editar/:id" element={<EditPet />} />
            <Route path="/adoptante/:id" element={<AdopterProfileView />} />
            <Route path="/favoritos" element={<Favorites />} />
            <Route path="/historial" element={<History />} />
            <Route element={<AppLayout />}>
              <Route path="/descubrir" element={<Discover />} />
              <Route path="/buscar" element={<Browse />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/chats" element={<ChatList />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/notificaciones" element={<Notifications />} />
              <Route path="/responsable" element={<OwnerHome />} />
              <Route path="/admin" element={<AdminShell />}>
                <Route index element={<AdminDashboard />} />
                <Route path="usuarios" element={<AdminUsers />} />
                <Route path="usuarios/:id" element={<AdminUserDetail />} />
                <Route path="publicaciones" element={<AdminPublications />} />
                <Route path="publicaciones/:id" element={<AdminPublicationDetail />} />
                <Route path="reportes" element={<AdminReports />} />
                <Route path="reportes/:id" element={<AdminReportDetail />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DeviceFrame>
    </HashRouter>
  );
}
