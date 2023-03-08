export interface UiPermissionItem {
  key: string;
  title: string;
  cascadeKeys: string[];
}
export interface PermissionItem {
  key: string;
  title: string;
  uiPermissions: UiPermissionItem[];
  children?: PermissionItem[];
}
export type PermissionListType = PermissionItem[];
export interface RolesPermission {
  menu: string[];
  checkedPermissions: string[];
}
export type PemissionsMapType = Record<
  string,
  PermissionItem & { parent: string | null }
>;

export type cascadeIdsMapItemType = {
  menuKey: string;
  cascadeKeys: string[];
};
