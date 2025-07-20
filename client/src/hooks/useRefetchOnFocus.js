import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * A custom hook that triggers refetch functions when a component comes into focus
 * or when the route changes.
 * 
 * @param {Function|Array<Function>} refetchFunctions - Single refetch function or array of refetch functions to call
 * @param {Object} options - Additional options
 * @param {boolean} options.refetchOnMount - Whether to refetch on initial mount (default: true)
 * @param {boolean} options.refetchOnRouteChange - Whether to refetch on route change (default: true)
 */
export const useRefetchOnFocus = (refetchFunctions, options = {}) => {
  const { refetchOnMount = true, refetchOnRouteChange = true } = options;
  const location = useLocation();
  
  // Convert single function to array if needed
  const refetchArray = Array.isArray(refetchFunctions) 
    ? refetchFunctions 
    : [refetchFunctions];
  
  // Filter out any undefined or null functions
  const validRefetchFunctions = refetchArray.filter(fn => typeof fn === 'function');
  
  // Function to execute all refetch functions
  const refetchAll = () => {
    validRefetchFunctions.forEach(refetch => {
      try {
        refetch();
      } catch (error) {
        console.error('Error during refetch:', error);
      }
    });
  };

  // Refetch when component mounts
  useEffect(() => {
    if (refetchOnMount && validRefetchFunctions.length > 0) {
      refetchAll();
    }
  }, []);

  // Refetch when route changes
  useEffect(() => {
    if (refetchOnRouteChange && validRefetchFunctions.length > 0) {
      refetchAll();
    }
  }, [location.pathname]);

  return { refetchAll };
};
