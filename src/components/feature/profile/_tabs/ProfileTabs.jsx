'use client';

import { NotificationsTab } from './NotificationsTab';
import { PersonalTab } from './PersonalTab';
import { SecurityTab } from './SecurityTab';
import { WalletTab } from './WalletTab';

export function ProfileTabs(props) {
  const { activeTab } = props;

  return (
    <div className="lg:col-span-2">
      {activeTab === 'personal' && (
        <PersonalTab
          isEditing={props.isEditing}
          handleStartEdit={props.handleStartEdit}
          handleCancelEdit={props.handleCancelEdit}
          handleSaveProfile={props.handleSaveProfile}
          savingProfile={props.savingProfile}
          user={props.user}
          formData={props.formData}
          setFormData={props.setFormData}
          genderLabels={props.genderLabels}
          getGenderLabel={props.getGenderLabel}
          addresses={props.addresses}
          handleOpenAddressModal={props.handleOpenAddressModal}
        />
      )}

      {activeTab === 'wallet' && (
        <WalletTab
          walletLoading={props.walletLoading}
          wallet={props.wallet}
          formatCurrency={props.formatCurrency}
          onOpenTopupModal={props.onOpenTopupModal}
          recentTransactions={props.recentTransactions}
          getTransactionAmount={props.getTransactionAmount}
          getTransactionIcon={props.getTransactionIcon}
          getTransactionTitle={props.getTransactionTitle}
          formatTransactionTime={props.formatTransactionTime}
          getTransactionStatus={props.getTransactionStatus}
        />
      )}

      {activeTab === 'security' && (
        <SecurityTab
          setIsChangePasswordModalOpen={props.setIsChangePasswordModalOpen}
          is2FAEnabled={props.is2FAEnabled}
          setIs2FAEnabled={props.setIs2FAEnabled}
        />
      )}

      {activeTab === 'notifications' && (
        <NotificationsTab
          notifFilters={props.notifFilters}
          activeNotifFilter={props.activeNotifFilter}
          setActiveNotifFilter={props.setActiveNotifFilter}
          filteredNotifs={props.filteredNotifs}
        />
      )}
    </div>
  );
}
