import { PermissionItem, PermissionListType, RolesPermission } from './typing';

export const flatMapFn = (
  list: PermissionListType,
  parent: string | null = null,
) => {
  return list.reduce(
    (res: Record<string, PermissionItem & { parent: string | null }>, item) => {
      const { key, title, uiPermissions, children } = item;
      let data = { ...res };
      data[key] = {
        key,
        title,
        uiPermissions,
        parent,
        ...(children && { children }),
      };
      if (children) {
        const childrenMenus = flatMapFn(children, key);
        data = { ...data, ...childrenMenus };
      }
      return data;
    },
    {},
  );
};
export const deepCollectMenusCheckedPermissions = (
  list: PermissionListType,
) => {
  return list.reduce(
    (
      res: RolesPermission & { cascadeIdsMap: Record<string, string[]> },
      item,
    ) => {
      let { menu, checkedPermissions, cascadeIdsMap } = res;
      const { uiPermissions, key, children } = item;
      menu = [...menu, key];
      const uiPermissionKeys = uiPermissions.map((u) => {
        const { key, cascadeKeys } = u;
        if (cascadeKeys) {
          cascadeIdsMap[key] = cascadeKeys;
        }
        return key;
      });
      checkedPermissions = [...checkedPermissions, ...uiPermissionKeys];
      if (children) {
        const {
          menu: subMenus,
          checkedPermissions: subUiCollection,
          cascadeIdsMap: subCascadeIdsMap,
        } = deepCollectMenusCheckedPermissions(children);
        menu = [...menu, ...subMenus];
        checkedPermissions = [...checkedPermissions, ...subUiCollection];
        cascadeIdsMap = { ...cascadeIdsMap, ...subCascadeIdsMap };
      }
      return { menu, checkedPermissions, cascadeIdsMap };
    },
    { menu: [], checkedPermissions: [], cascadeIdsMap: {} },
  );
};

export const findDependsCascadeIds = (key, cascadeIdsMap) => {
  const cascadeKeys = cascadeIdsMap[key];
  if (cascadeKeys) {
    const dependKeys = cascadeKeys.reduce(
      (res, item) => [
        ...res,
        item,
        ...findDependsCascadeIds(item, cascadeIdsMap),
      ],
      [],
    );
    return dependKeys;
  }
  return [];
};
