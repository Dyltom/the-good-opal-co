'use client'

import React, { createContext, useContext, type ReactNode } from 'react'
import type { Tenant, TenantContext as TenantContextType } from '@/types'

/**
 * Tenant Context
 * Provides tenant information throughout the React component tree
 */
const TenantContext = createContext<TenantContextType | null>(null)

/**
 * Tenant Provider Props
 */
interface TenantProviderProps {
  children: ReactNode
  tenant: Tenant | null
  hostname: string
}

/**
 * Tenant Provider Component
 * Wraps the app to provide tenant context
 */
export function TenantProvider({ children, tenant, hostname }: TenantProviderProps) {
  if (!tenant) {
    // If no tenant, render children without context
    return <>{children}</>
  }

  const contextValue: TenantContextType = {
    tenant,
    isSubdomain: !!tenant.subdomain,
    isCustomDomain: !!tenant.domain,
    hostname,
  }

  return <TenantContext.Provider value={contextValue}>{children}</TenantContext.Provider>
}

/**
 * useTenant Hook
 * Access tenant context in components
 * @throws Error if used outside TenantProvider
 */
export function useTenant(): TenantContextType {
  const context = useContext(TenantContext)

  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider')
  }

  return context
}

/**
 * useTenantOptional Hook
 * Access tenant context in components (returns null if not in provider)
 */
export function useTenantOptional(): TenantContextType | null {
  return useContext(TenantContext)
}

/**
 * useIsTenant Hook
 * Check if currently in a tenant context
 */
export function useIsTenant(): boolean {
  const context = useContext(TenantContext)
  return context !== null
}

/**
 * useTenantFeature Hook
 * Check if a specific feature is enabled for the current tenant
 */
export function useTenantFeature(
  feature: keyof Tenant['config']['features']
): boolean {
  const context = useContext(TenantContext)

  if (!context) {
    return false
  }

  return context.tenant.config.features[feature] || false
}

/**
 * useTenantTheme Hook
 * Get theme configuration for the current tenant
 */
export function useTenantTheme(): Tenant['theme'] | null {
  const context = useContext(TenantContext)

  if (!context) {
    return null
  }

  return context.tenant.theme
}
