import { lazy, Suspense, type ComponentType } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { DeviceFrame } from "@/shell/DeviceFrame";
import { AppLayout } from "@/shell/AppLayout";
import { RequireAuth } from "@/shell/RequireAuth";
import { Splash } from "@/screens/Splash";
import { Login } from "@/screens/auth/Login";
import { Register } from "@/screens/auth/Register";
import { Discover } from "@/screens/Discover";

// Code-splitting by screen: the first paint only needs the splash, auth and the deck.
const lazyNamed = <K extends string>(
  load: () => Promise<Record<K, ComponentType>>,
  name: K,
) => lazy(() => load().then((m) => ({ default: m[name] })));
const Recover = lazyNamed(() => import("@/screens/auth/Recover"), "Recover");
const Onboarding = lazyNamed(
  () => import("@/screens/Onboarding"),
  "Onboarding",
);
const Browse = lazyNamed(() => import("@/screens/Browse"), "Browse");
const Matches = lazyNamed(() => import("@/screens/Matches"), "Matches");
const PetProfile = lazyNamed(
  () => import("@/screens/PetProfile"),
  "PetProfile",
);
const ChatList = lazyNamed(() => import("@/screens/chat/ChatList"), "ChatList");
const ChatThreadScreen = lazyNamed(
  () => import("@/screens/chat/ChatThread"),
  "ChatThreadScreen",
);
const Coordinate = lazyNamed(
  () => import("@/screens/Coordinate"),
  "Coordinate",
);
const Profile = lazyNamed(() => import("@/screens/Profile"), "Profile");
const Favorites = lazyNamed(() => import("@/screens/Favorites"), "Favorites");
const History = lazyNamed(() => import("@/screens/History"), "History");
const Guide = lazyNamed(() => import("@/screens/Guide"), "Guide");
const Notifications = lazyNamed(
  () => import("@/screens/Notifications"),
  "Notifications",
);
const Credits = lazyNamed(() => import("@/screens/Credits"), "Credits");
const OwnerHome = lazyNamed(
  () => import("@/screens/owner/OwnerHome"),
  "OwnerHome",
);
const AdminShell = lazyNamed(
  () => import("@/screens/admin/AdminShell"),
  "AdminShell",
);
const AdminDashboard = lazyNamed(
  () => import("@/screens/admin/AdminDashboard"),
  "AdminDashboard",
);
const AdminUsers = lazyNamed(
  () => import("@/screens/admin/AdminUsers"),
  "AdminUsers",
);
const AdminUserDetail = lazyNamed(
  () => import("@/screens/admin/AdminUserDetail"),
  "AdminUserDetail",
);
const AdminPublications = lazyNamed(
  () => import("@/screens/admin/AdminPublications"),
  "AdminPublications",
);
const AdminPublicationDetail = lazyNamed(
  () => import("@/screens/admin/AdminPublicationDetail"),
  "AdminPublicationDetail",
);
const AdminReports = lazyNamed(
  () => import("@/screens/admin/AdminReports"),
  "AdminReports",
);
const AdminReportDetail = lazyNamed(
  () => import("@/screens/admin/AdminReportDetail"),
  "AdminReportDetail",
);
const NewPet = lazyNamed(() => import("@/screens/owner/NewPet"), "NewPet");
const EditPet = lazyNamed(() => import("@/screens/owner/EditPet"), "EditPet");
const AdopterProfileView = lazyNamed(
  () => import("@/screens/AdopterProfileView"),
  "AdopterProfileView",
);

function Loading() {
  return (
    <div
      className="flex h-full items-center justify-center"
      aria-label="Cargando"
    >
      <span className="animate-bounce text-4xl">🐾</span>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <DeviceFrame>
        <Suspense fallback={<Loading />}>
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
                  <Route
                    path="publicaciones/:id"
                    element={<AdminPublicationDetail />}
                  />
                  <Route path="reportes" element={<AdminReports />} />
                  <Route path="reportes/:id" element={<AdminReportDetail />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </DeviceFrame>
    </HashRouter>
  );
}
