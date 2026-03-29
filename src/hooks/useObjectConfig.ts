import { useEffect, useState } from 'react';
import { metaGovService, type MetaObjectProperty, type MetaObjectType } from '../services/metaGovService';

type ObjectConfigLookupMode = 'id' | 'slug';

export function useObjectConfig(objectTypeIdentifier: string | null, mode: ObjectConfigLookupMode = 'id') {
  const [properties, setProperties] = useState<MetaObjectProperty[]>([]);
  const [objectType, setObjectType] = useState<MetaObjectType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!objectTypeIdentifier) return;

    setIsLoading(true);
    setError(null);

    const loadConfig = async () => {
      const types = await metaGovService.getObjectTypes();
      const type = types.find((candidate) =>
        mode === 'slug' ? candidate.slug === objectTypeIdentifier : candidate.id === objectTypeIdentifier
      );

      if (!type) {
        throw new Error(`Tipo de objeto não encontrado (${objectTypeIdentifier}).`);
      }

      const props = await metaGovService.getObjectConfig(type.id);

      return { props, type };
    };

    loadConfig()
      .then(({ props, type }) => {
        setProperties(props);
        setObjectType(type);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        setProperties([]);
        setObjectType(null);
        setError(err instanceof Error ? err.message : 'Erro ao carregar configuração');
        setIsLoading(false);
      });
  }, [objectTypeIdentifier, mode]);

  return { properties, objectType, isLoading, error };
}
