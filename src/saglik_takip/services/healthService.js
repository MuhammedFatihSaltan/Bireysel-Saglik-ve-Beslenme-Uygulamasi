import { supabase } from '../../supabaseClient';
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'health_life_secret_key';

export const healthService = {
  cacheData: (key, data) => {
    try {
      const jsonString = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
      localStorage.setItem(`hl_cache_${key}`, encrypted);
    } catch (error) {
      console.error('Cache yazma hatası:', error);
    }
  },

  getCacheData: (key) => {
    try {
      const encrypted = localStorage.getItem(`hl_cache_${key}`);
      if (!encrypted) return null;
      const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Cache okuma hatası:', error);
      return null;
    }
  },

  getMetrics: async (userId) => {
    if (!userId) throw new Error('User ID is required');

    const cachedData = healthService.getCacheData(`metrics_${userId}`);

    try {
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      healthService.cacheData(`metrics_${userId}`, data);

      return data;
    } catch (error) {
      console.error('Supabase getMetrics error:', error);
      return cachedData || [];
    }
  },

  addMetric: async (userId, metricData) => {
    if (!userId) throw new Error('User ID is required');

    try {
      const { data, error } = await supabase
        .from('health_metrics')
        .insert([{ user_id: userId, ...metricData }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Supabase addMetric error:', error);
      throw error;
    }
  },

  deleteMetric: async (id) => {
    try {
      const { error } = await supabase
        .from('health_metrics')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Supabase deleteMetric error:', error);
      throw error;
    }
  }
};
