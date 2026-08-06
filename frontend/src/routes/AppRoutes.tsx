import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { ExplorerPage } from '../pages/ExplorerPage';
import { ConceptBookPage } from '../pages/ConceptBookPage';
import { LeaderboardPage } from '../pages/LeaderboardPage';
import { PlansPage } from '../pages/PlansPage';
import { AuthPage } from '../pages/AuthPage';
import { BlocklyPage } from '../pages/BlocklyPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<Navigate to="/" replace />} />
      <Route path="/explorer" element={<ExplorerPage />} />
      <Route path="/visual-programmer" element={<BlocklyPage />} />
      <Route path="/concept-book" element={<ConceptBookPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/plans" element={<PlansPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
