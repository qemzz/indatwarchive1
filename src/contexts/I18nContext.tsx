import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Lang = "en" | "fr";

const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Nav
    "nav.home": "Home",
    "nav.documents": "Documents",
    "nav.pastPapers": "Past Papers",
    "nav.books": "Books",
    "nav.notes": "Notes",
    "nav.about": "About",
    "nav.login": "Login",
    "nav.dashboard": "Dashboard",
    "nav.approvals": "Approvals",
    "nav.upload": "Upload",
    "nav.myUploads": "My Uploads",
    "nav.folders": "Folders",
    "nav.users": "Users",
    "nav.analytics": "Analytics",
    "nav.recycleBin": "Recycle Bin",
    "nav.settings": "Settings",
    "nav.logout": "Logout",
    // Status
    "status.pending": "Pending",
    "status.approved": "Approved",
    "status.rejected": "Rejected",
    // Actions
    "action.approve": "Approve",
    "action.reject": "Reject",
    "action.preview": "Preview",
    "action.upload": "Upload",
    "action.search": "Search documents…",
    "action.filter": "Filter",
    "action.create": "Create",
    "action.delete": "Delete",
    "action.restore": "Restore",
    "action.save": "Save",
    "action.cancel": "Cancel",
    // Labels
    "label.class": "Class",
    "label.subject": "Subject",
    "label.year": "Year",
    "label.category": "Category",
    "label.status": "Status",
    "label.uploadedBy": "Uploaded by",
    "label.date": "Date",
    "label.size": "Size",
    "label.noDocuments": "No documents found",
    "label.noPending": "No pending documents",
    "label.welcome": "Welcome",
    "label.schoolPortal": "School Document Portal",
    "label.heroSubtitle": "Access past papers, notes, books and revision materials for S1–S6",
    "label.browseResources": "Browse Resources",
    "label.totalDocuments": "Total Documents",
    "label.pendingReview": "Pending Review",
    "label.approvedDocs": "Approved",
    "label.totalDownloads": "Downloads",
    "label.recentUploads": "Recent Uploads",
    "label.quickActions": "Quick Actions",
    "label.rejectionReason": "Rejection Reason",
    "label.email": "Email",
    "label.password": "Password",
    "label.signIn": "Sign In",
  },
  fr: {
    "nav.home": "Accueil",
    "nav.documents": "Documents",
    "nav.pastPapers": "Examens Passés",
    "nav.books": "Livres",
    "nav.notes": "Notes",
    "nav.about": "À propos",
    "nav.login": "Connexion",
    "nav.dashboard": "Tableau de bord",
    "nav.approvals": "Approbations",
    "nav.upload": "Télécharger",
    "nav.myUploads": "Mes Téléchargements",
    "nav.folders": "Dossiers",
    "nav.users": "Utilisateurs",
    "nav.analytics": "Analytique",
    "nav.recycleBin": "Corbeille",
    "nav.settings": "Paramètres",
    "nav.logout": "Déconnexion",
    "status.pending": "En attente",
    "status.approved": "Approuvé",
    "status.rejected": "Rejeté",
    "action.approve": "Approuver",
    "action.reject": "Rejeter",
    "action.preview": "Aperçu",
    "action.upload": "Télécharger",
    "action.search": "Rechercher des documents…",
    "action.filter": "Filtrer",
    "action.create": "Créer",
    "action.delete": "Supprimer",
    "action.restore": "Restaurer",
    "action.save": "Enregistrer",
    "action.cancel": "Annuler",
    "label.class": "Classe",
    "label.subject": "Matière",
    "label.year": "Année",
    "label.category": "Catégorie",
    "label.status": "Statut",
    "label.uploadedBy": "Téléchargé par",
    "label.date": "Date",
    "label.size": "Taille",
    "label.noDocuments": "Aucun document trouvé",
    "label.noPending": "Aucun document en attente",
    "label.welcome": "Bienvenue",
    "label.schoolPortal": "Portail de Documents Scolaires",
    "label.heroSubtitle": "Accédez aux examens, notes, livres et révisions pour S1–S6",
    "label.browseResources": "Parcourir les Ressources",
    "label.totalDocuments": "Total Documents",
    "label.pendingReview": "En Attente",
    "label.approvedDocs": "Approuvés",
    "label.totalDownloads": "Téléchargements",
    "label.recentUploads": "Téléchargements Récents",
    "label.quickActions": "Actions Rapides",
    "label.rejectionReason": "Raison du Rejet",
    "label.email": "Email",
    "label.password": "Mot de passe",
    "label.signIn": "Se connecter",
  },
};

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export const useI18n = () => useContext(I18nContext);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem("lang");
    return (stored === "fr" ? "fr" : "en") as Lang;
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  }, []);

  const t = useCallback(
    (key: string) => translations[lang][key] || key,
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};
