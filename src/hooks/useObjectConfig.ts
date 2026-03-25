import { useEffect, useState } from 'react';
import { metaGovService, type MetaObjectProperty, type MetaObjectType } from '../services/metaGovService';

export function useObjectConfig(objectTypeId: string | null) {
  const [properties, setProperties] = useState<MetaObjectProperty[]>([]);
  const [objectType, setObjectType] = useState<MetaObjectType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!objectTypeId) return;

    setIsLoading(true);
    Promise.all([
      metaGovService.getObjectConfig(objectTypeId),
      metaGovService.getObjectTypes().then((types) => types.find((t) => t.id === objectTypeId) ?? null),
    ])
      .then(([props, type]) => {
        setProperties(props);
        setObjectType(type);
        setError(null);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Erro ao carregar configuração');
        setIsLoading(false);
      });
  }, [objectTypeId]);

  return { properties, objectType, isLoading, error };
}
