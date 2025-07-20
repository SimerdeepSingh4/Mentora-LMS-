import { useNavigate } from 'react-router-dom';
import { useLoadUserQuery } from '@/features/api/authApi';
import { useGetPurchasedCoursesQuery } from '@/features/api/purchaseApi';

/**
 * A custom hook that provides navigation with automatic data refetching
 * to ensure fresh data when navigating between pages.
 * 
 * @returns {Function} A function that navigates to the specified path after refetching data
 */
export const useNavigateWithRefetch = () => {
  const navigate = useNavigate();
  const { refetch: refetchUser } = useLoadUserQuery();
  const { refetch: refetchPurchasedCourses } = useGetPurchasedCoursesQuery();
  
  /**
   * Navigate to the specified path after refetching important data
   * 
   * @param {string} path - The path to navigate to
   * @param {Object} options - Navigation options (same as React Router's navigate options)
   */
  const navigateWithRefetch = (path, options = {}) => {
    // Refetch critical data before navigation
    Promise.all([
      refetchUser(),
      refetchPurchasedCourses()
    ]).then(() => {
      // Navigate after refetching
      navigate(path, options);
    }).catch(error => {
      console.error('Error refetching data before navigation:', error);
      // Navigate anyway even if refetch fails
      navigate(path, options);
    });
  };
  
  return navigateWithRefetch;
};
