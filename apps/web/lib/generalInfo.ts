'use client';

import { useState, useEffect } from 'react';

export interface GeneralInfo {
  mill_name: string;
  tagline: string;
  owner_name: string;
  ntn_number: string;
  address: string;
  city: string;
  phone_primary: string;
  phone_secondary: string;
  email: string;
  website: string;
  facebook_link: string;
  twitter_link: string;
  instagram_link: string;
  logo_url: string;
  established_year: string;
  license_number: string;
}

export const EMPTY_GENERAL_INFO: GeneralInfo = {
  mill_name: '',
  tagline: '',
  owner_name: '',
  ntn_number: '',
  address: '',
  city: '',
  phone_primary: '',
  phone_secondary: '',
  email: '',
  website: '',
  facebook_link: '',
  twitter_link: '',
  instagram_link: '',
  logo_url: '',
  established_year: '',
  license_number: '',
};

export const GENERAL_INFO_KEY = 'flour_erp_general_info';
export const GENERAL_INFO_EVENT = 'flour_erp_general_info_updated';

export const getGeneralInfo = (): GeneralInfo => {
  if (typeof window === 'undefined') return EMPTY_GENERAL_INFO;
  try {
    const raw = localStorage.getItem(GENERAL_INFO_KEY);
    if (raw) return { ...EMPTY_GENERAL_INFO, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to parse general info from localStorage:', e);
  }
  return { ...EMPTY_GENERAL_INFO };
};

export const saveGeneralInfo = (info: GeneralInfo): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GENERAL_INFO_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent(GENERAL_INFO_EVENT, { detail: info }));
  } catch (e) {
    console.error('Failed to save general info to localStorage:', e);
  }
};

export const useGeneralInfo = (): GeneralInfo => {
  const [info, setInfo] = useState<GeneralInfo>(() => getGeneralInfo());

  useEffect(() => {
    // Initial fetch once mounted on client
    const current = getGeneralInfo();
    setInfo(current);
    if (typeof document !== 'undefined' && current.mill_name) {
      document.title = `${current.mill_name} - Flour ERP`;
    }

    const handleUpdate = () => {
      const updated = getGeneralInfo();
      setInfo(updated);
      if (typeof document !== 'undefined' && updated.mill_name) {
        document.title = `${updated.mill_name} - Flour ERP`;
      }
    };

    window.addEventListener(GENERAL_INFO_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(GENERAL_INFO_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return info;
};
