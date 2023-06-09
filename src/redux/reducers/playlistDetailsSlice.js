import {
  PLAYLIST_DETAILS_ADD_TO_PLAYLIST_DETAILS,
  PLAYLIST_DETAILS_DELETE_FROM_PLAYLIST_DETAILS,
  PLAYLIST_DETAILS_ETAG,
  PLAYLIST_DETAILS_LAST_PLAYED,
  PLAYLIST_DETAILS_LAST_PLAYED_ALL,
  PLAYLIST_DETAILS_LENGTH,
} from '../constants/playlistDetailsTypes';

const initialState = [];

export default function playlistDetailsReducer(state = initialState, action) {
  switch (action.type) {
    case 'playlistDetails/add': {
      return action.payload;
    }
    case PLAYLIST_DETAILS_ADD_TO_PLAYLIST_DETAILS: {
      if (
        state.filter(
          (element) => element.playlistId === action.payload.playlistId,
        ).length
      ) {
        return state;
      } return [...state, action.payload];
    }
    case PLAYLIST_DETAILS_DELETE_FROM_PLAYLIST_DETAILS: {
      return state.filter((element) => element.playlistId !== action.payload);
    }
    case PLAYLIST_DETAILS_ETAG: {
      return state.map((ele) => {
        if (ele.playlistId === action.payload.playlistId) {
          return {
            ...ele,
            playlistEtag: action.payload.etag,
          };
        }
        return ele;
      });

      // return {...state, playlistEtag: action.payload}
    }
    case PLAYLIST_DETAILS_LAST_PLAYED: {
      return state.map((ele) => {
        if (ele.playlistId === action.payload.playlistId) {
          return {
            ...ele,
            currentIndex: action.payload.currentIndex,
          };
        }
        return ele;
      });
    }
    case PLAYLIST_DETAILS_LAST_PLAYED_ALL: {
      return state.map((ele) => ({
        ...ele,
        currentIndex: 0,
      }));
    }
    case PLAYLIST_DETAILS_LENGTH: {
      return state.map((ele) => {
        if (ele.playlistId === action.payload.playlistId) {
          return {
            ...ele,
            playlistLength: action.payload.playlistLength,
          };
        }
        return ele;
      });
    }
    default:
      return state;
  }
}
