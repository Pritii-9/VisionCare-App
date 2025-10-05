/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

const API_BASE_URL = 'http://localhost:5000/api';

interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

// Custom fetcher function to handle API calls
export const useApi = <T>(endpoint: string, initialData: T, autoFetch = true) => {
  const [state, setState] = useState<FetchState<T>>({
    data: initialData,
    isLoading: autoFetch,
    error: null,
  });
  const { toast } = useToast();

  const fetchData = useCallback(async (customEndpoint?: string, method: string = 'GET', body: any = null) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    const url = `${API_BASE_URL}${customEndpoint || endpoint}`;

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || `API Error: ${response.status} ${response.statusText}`;
        setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
        toast({
          title: "API Error",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, data: responseData };
      }

      // ONLY update state if the endpoint is the one this hook is tracking (i.e., not a custom refetch)
      if (!customEndpoint) {
          setState(prev => ({ ...prev, data: responseData as T, isLoading: false }));
      } else if (method === 'GET') {
          // If a GET is performed via refetch (e.g., refetch()), update state
          setState(prev => ({ ...prev, data: responseData as T, isLoading: false }));
      }
      
      return { success: true, data: responseData };

    } catch (err: any) {
      const errorMessage = `Connection Error: ${err.message}`;
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      toast({
        title: "Connection Failed",
        description: "Could not connect to the backend server.",
        variant: "destructive",
      });
      return { success: false, data: null };
    }
  }, [endpoint, toast]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return { ...state, refetch: fetchData };
};

// Simple hook for POST requests (used for forms)
export const usePost = () => {
  const { toast } = useToast();
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const postData = async (endpoint: string, body: any) => {
    setIsPosting(true);
    setPostError(null);
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || 'Post operation failed.';
        setPostError(errorMessage);
        toast({ title: "Operation Failed", description: errorMessage, variant: "destructive" });
        setIsPosting(false);
        return { success: false, data: responseData };
      }

      toast({ title: "Success", description: responseData.message || "Operation completed successfully." });
      setIsPosting(false);
      return { success: true, data: responseData };

    } catch (err: any) {
      const errorMessage = `Connection Error: ${err.message}`;
      setPostError(errorMessage);
      toast({ title: "Connection Failed", description: "Could not connect to the backend server.", variant: "destructive" });
      setIsPosting(false);
      return { success: false, data: null };
    }
  };

  return { postData, isPosting, postError };
};