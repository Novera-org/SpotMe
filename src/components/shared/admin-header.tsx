import type { ReactNode } from "react";

interface AdminHeaderProps {
  actions?: ReactNode;
  userLabel: string;
}

export function AdminHeader({ actions, userLabel }: AdminHeaderProps) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header-inner">
        <h1 className="dashboard-brand">SpotMe</h1>
        <div className="dashboard-header-right">
          <span className="dashboard-user-email">{userLabel}</span>
          {actions ? <div className="dashboard-header-actions">{actions}</div> : null}
        </div>
      </div>
    </header>
  );
}
