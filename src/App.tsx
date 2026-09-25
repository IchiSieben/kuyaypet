import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DeviceFrame } from '@/shell/DeviceFrame';
import { AppLayout } from '@/shell/AppLayout';
import { RequireAuth } from '@/shell/RequireAuth';
import { Splash } from '@/screens/Splash';
import { Login } from '@/screens/auth/Login';
import { Register } from '@/screens/auth/Register';
import { Onboarding } from '@/screens/Onboarding';
import { Discover } from '@/screens/Discover';
import { Browse } from '@/screens/Browse';
import { Matches } from '@/screens/Matches';
import { PetProfile } from '@/screens/PetProfile';
import { ChatList } from '@/screens/chat/ChatList';
import { ChatThreadScreen } from '@/screens/chat/ChatThread';
import { Coordinate } from '@/screens/Coordinate';
import { Profile } from '@/screens/Profile';
import { Notifications } from '@/screens/Notifications';
import { Credits } from '@/screens/Credits';
import { OwnerHome } from '@/screens/owner/OwnerHome';
import { NewPet } from '@/screens/owner/NewPet';
import { EditPet } from '@/screens/owner/EditPet';
import { AdminHome } from '@/screens/admin/AdminHome';
import { AdopterProfileView } from '@/screens/AdopterProfileView';

export default function App() {
  return (
    <HashRouter>
      <DeviceFrame>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/creditos" element={<Credits />} />
          <Route element={<RequireAuth />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/mascota/:id" element={<PetProfile />} />
            <Route path="/chats/:id" element={<ChatThreadScreen />} />
            <Route path="/coordinar/:petId" element={<Coordinate />} />
            <Route path="/responsable/nueva" element={<NewPet />} />
            <Route path="/responsable/editar/:id" element={<EditPet />} />
            <Route path="/adoptante/:id" element={<AdopterProfileView />} />
            <Route element={<AppLayout />}>
              <Route path="/descubrir" element={<Discover />} />
              <Route path="/buscar" element={<Browse />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/chats" element={<ChatList />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/notificaciones" element={<Notifications />} />
              <Route path="/responsable" element={<OwnerHome />} />
              <Route path="/admin" element={<AdminHome />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DeviceFrame>
    </HashRouter>
  );
}
