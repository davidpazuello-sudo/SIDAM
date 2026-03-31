import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import type { ObjectProperty, ObjectType } from '../types';

interface UseObjectTypeState {
  data: ObjectType | null;
  properties: ObjectProperty[];
  isLoading: boolean;
  error: string | null;
}

function mapObjectType(row: Record<string, unknown>): ObjectType {
  return {
    slug: String(row.slug ?? 'fda'),
    name: String(row.name ?? 'Objeto'),
    storage_mode: (row.storage_mode as ObjectType['storage_mode']) ?? 'table',
    table_name: String(row.table_name ?? 'obj_fda'),
    configuration: (row.configuration as Record<string, unknown>) ?? {},
  };
}

function mapObjectProperty(
  row: Record<string, unknown>,
  objectTypeSlug: string
): ObjectProperty {
  return {
    id: String(row.id),
    object_type_slug: String(row.object_type_slug ?? objectTypeSlug),
    name: String(row.name),
    slug: String(row.slug),
    data_type: String(row.data_type ?? 'string'),
    ui_component: String(row.ui_component ?? 'TextInput'),
    is_required: Boolean(row.is_required),
    sort_order: Number(row.sort_order ?? 0),
    configuration: (row.configuration as Record<string, unknown>) ?? {},
  };
}

export function useObjectType(slug: string) {
  const [state, setState] = useState<UseObjectTypeState>({
    data: null,
    properties: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const typeResult = await (supabase as any)
          .from('meta_object_types')
          .select('*')
          .eq('slug', slug)
          .single();

        const typeRow = typeResult.data;
        const typeError = typeResult.error;

        const cfgTypeResult = typeError
          ? await (supabase as any)
              .from('cfg_object_types')
              .select('*')
              .eq('slug', slug)
              .single()
          : null;

        const resolvedTypeRow = typeRow ?? cfgTypeResult?.data;
        const resolvedTypeError =
          typeError && !cfgTypeResult?.data ? cfgTypeResult?.error ?? typeError : null;

        if (resolvedTypeError || !resolvedTypeRow) {
          throw resolvedTypeError ?? new Error(`Objeto ${slug} não encontrado`);
        }

        const objectType = mapObjectType(resolvedTypeRow as Record<string, unknown>);

        const propsBySlugResult = await (supabase as any)
          .from('meta_object_properties')
          .select('*')
          .eq('object_type_slug', slug)
          .order('sort_order');

        const propsByIdResult =
          propsBySlugResult.error || !propsBySlugResult.data?.length
            ? await (supabase as any)
                .from('cfg_object_properties')
                .select('*')
                .eq('object_type_id', resolvedTypeRow.id)
                .order('sort_order')
            : null;

        const resolvedProps = propsBySlugResult.data?.length
          ? propsBySlugResult.data
          : propsByIdResult?.data ?? [];

        if (propsBySlugResult.error && propsByIdResult?.error) {
          throw propsByIdResult.error;
        }

        if (!isMounted) return;

        setState({
          data: objectType,
          properties: (resolvedProps as Record<string, unknown>[]).map((row) =>
            mapObjectProperty(row, objectType.slug)
          ),
          isLoading: false,
          error: null,
        });
      } catch (err: unknown) {
        if (!isMounted) return;
        setState({
          data: null,
          properties: [],
          isLoading: false,
          error: err instanceof Error ? err.message : 'Erro ao carregar objeto',
        });
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  return state;
}

