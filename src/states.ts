import {
    FnodeId,
    BranchId,
    RegularFileFnodeView,
    DirectoryFnodeView,
} from './interfaces';

export const enum SyncState {
    DL_ING,
    DL_SUCC_REGULAR_FILE,
    DL_SUCC_DIRECTORY,
    DL_FAIL,
    UL_ING_REGULAR_FILE,
    UL_ING_DIRECTORY,
}

interface StateGeneric {
    branch: BranchId;
    root: FnodeId;
    filePathArray: string[];
}
interface StateDownloadIng extends StateGeneric { }
interface StateDownloadSuccRegularFile extends StateGeneric {
    sync: SyncState.DL_SUCC_REGULAR_FILE;
    view: string;
}
interface StateDownloadSuccDirecrtory extends StateGeneric {
    sync: SyncState.DL_SUCC_DIRECTORY;
    view: DirectoryFnodeView;
}
interface StateDownloadFail extends StateGeneric { }
interface StateUploadIngRegularFile extends StateGeneric {
    sync: SyncState.UL_ING_REGULAR_FILE;
    view: string;
}
interface StateUploadIngDirectory extends StateGeneric {
    sync: SyncState.UL_ING_DIRECTORY;
    view: RegularFileFnodeView;
}
export type State =
    StateDownloadIng |
    StateDownloadFail |
    StateDownloadSuccDirecrtory |
    StateDownloadSuccRegularFile |
    StateUploadIngDirectory |
    StateUploadIngRegularFile;

export type Snapshot = {
    branch: BranchId;
    root: FnodeId,
    filePathArray: string[];
    text: string;
} | null;
