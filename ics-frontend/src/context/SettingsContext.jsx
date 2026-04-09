import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('ics_station_settings');
    return saved ? JSON.parse(saved) : {
      stationName: 'Addis Ababa Station HQ',
      alertLevel: 'Normal',
      enableNotifications: true,
      refreshInterval: 30
    };
  });

  useEffect(() => {
    localStorage.setItem('ics_station_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return (
    <SettingsContext.Provider value={{ ...settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
