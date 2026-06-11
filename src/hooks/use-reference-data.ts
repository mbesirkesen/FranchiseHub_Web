"use client";

import { useQuery } from "@tanstack/react-query";
import { getBrandSectors, getReferenceCities } from "@/lib/api";
import { FRANCHISE_SECTORS, TR_CITIES } from "@/lib/tr-form-data";

export function useReferenceCities() {
  const query = useQuery({
    queryKey: ["reference-cities"],
    queryFn: getReferenceCities,
    staleTime: 1000 * 60 * 60,
  });
  return {
    ...query,
    cities: query.data?.length ? query.data : [...TR_CITIES],
  };
}

export function useBrandSectors() {
  const query = useQuery({
    queryKey: ["brand-sectors"],
    queryFn: getBrandSectors,
    staleTime: 1000 * 60 * 5,
  });
  return {
    ...query,
    sectors: query.data?.length ? query.data : [...FRANCHISE_SECTORS],
  };
}
