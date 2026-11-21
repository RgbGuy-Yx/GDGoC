import { useState, useEffect } from 'react';
import { getDomains } from '../api/leadApi';
import { DEFAULT_DOMAINS } from '../constants/domains';

export const useDomains = () => {
  const [domains, setDomains] = useState(DEFAULT_DOMAINS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDomains = async () => {
      try {
        const res = await getDomains();
        if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setDomains(res.data);
        }
      } catch (err) {
        // Keeps default official domains if API is unreachable
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDomains();
    return () => {
      isMounted = false;
    };
  }, []);

  return { domains, loading };
};
