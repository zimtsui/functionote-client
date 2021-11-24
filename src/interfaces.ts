// Fnode basic
export type FnodeType = '-' | 'd';
export type FnodeId = number;


// Fnode metadata
// interface FnodeGenericMetadata {
//     id: FnodeId;
//     mtime: number;
//     rmtime: number;
//     previousVersionId: FnodeId;
//     firstVersionId: FnodeId;
// }
// export interface RegularFileFnodeMetadata extends FnodeGenericMetadata {
//     type: '-';
// }
// export interface DirectoryFnodeMetadata extends FnodeGenericMetadata {
//     type: 'd';
// }
// export type FnodeMetadata = RegularFileFnodeMetadata | DirectoryFnodeMetadata;


// Fnode content
export type RegularFileFnodeContent = ArrayBuffer;
export interface DirectoryFnodeContentItem {
    id: FnodeId,
    name: string;
    btime: number;
}
export type DirectoryFnodeContent = DirectoryFnodeContentItem[];
export type FnodeContent = RegularFileFnodeContent | DirectoryFnodeContent;


// Fnode view
export type RegularFileFnodeView = RegularFileFnodeContent;
interface DirectoryFnodeViewItem {
    name: string;
    type: FnodeType;
    btime: number;
    rmtime: number;
}
export type DirectoryFnodeView = DirectoryFnodeViewItem[];
export type FnodeView = RegularFileFnodeView | DirectoryFnodeView;

export type MarkdownView = string;

// subscription
export type BranchId = number;
export type SubscriptionsView = {
    branchId: BranchId;
    branchName: string;
    latestVersionId: FnodeId;
}[];
