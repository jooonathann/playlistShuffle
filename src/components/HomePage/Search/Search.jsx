import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import fetchPlaylistVideos from '../../utils/fetchPlaylistVideos';
import fetchPlaylistData from '../../utils/fetchPlaylistData';
import {
  currentSong,
  setCurrentActivePlaylistId,
  isShuffleActive,
} from '../../../redux/actions/playerActions';
import {
  addToPlaylistDetails,
  modifyEtagInPlaylistDetailsById,
  lastPlayedPlaylistDetails,
} from '../../../redux/actions/playlistDetailsActions';
import { addSongsByPlaylistID } from '../../../redux/actions/playlistSongsByIdActions';

function Search({
  playlistDetails,
  currentSong,
  addToPlaylistDetails,
  addSongsByPlaylistID,
  playlistSongsById,
  setCurrentActivePlaylistId,
  modifyEtagInPlaylistDetailsById,
  isShuffleActive,
  player,
}) {
  const [playlistId, setPlaylistId] = useState('');
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [isIdInvalid, setIsIdInvalid] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoadingButton(true);
    isShuffleActive(false);
    const regex = /PL[\w-]+(?=&|$)/;
    const match = playlistId.match(regex);
    const id = match[0];
    const currentPlaylistInfo = playlistDetails.filter(
      (element) => element.playlistId === id,
    );

    setCurrentActivePlaylistId(id);

    const currEtag = currentPlaylistInfo.length > 0 ? currentPlaylistInfo[0].playlistEtag : '';
    const data = await fetchPlaylistVideos(id, currEtag);

    // if playlistDataInfo is 304 it means that the playlist hasn't change so
    // we can use the one in localStorage, that way we save api quota
    if (data === 304) {
      if (player.rememberLastVideo) {
        const findPlaylistIndex = playlistDetails.findIndex((element) => element.playlistId === id);

        currentSong(
          playlistSongsById[id][playlistDetails[findPlaylistIndex].currentIndex]
            .snippet.resourceId.videoId,
        );
      }
      setIsLoadingButton(false);
      navigate(`/${id}`);
    } else if (data === 404) {
      setIsIdInvalid(true);
      setIsLoadingButton(false);
    } else {
      const playlistDataInfo = await fetchPlaylistData(id, data.playlistEtag);
      const playlistEtagAndId = {
        playlistId: id,
        etag: data.playlistEtag,
      };
      await addToPlaylistDetails(playlistDataInfo);
      const playlistObject = {
        id,
        songs: data.responseArrToAdd,
      };

      await modifyEtagInPlaylistDetailsById(playlistEtagAndId);
      setIsLoadingButton(false);
      await addSongsByPlaylistID(playlistObject);
      await currentSong(data.currentSong);
      navigate(`/${id}`);
    }
  };
  const handleChange = (e) => {
    e.preventDefault();
    setPlaylistId(e.target.value);
  };
  return (
    <div className="searchContainer w-11/12 mx-auto ">
      <form className="" onSubmit={(e) => handleSubmit(e)}>
        <label htmlFor="searchInput" className="text-black">
          {`${
            isIdInvalid ? 'Invalid playlist' : 'Enter a playlist:'
          }`}
        </label>
        <div className="w-full flex h-12 justify-between">
          <input
            className={`inputSearch h-full shadow appearance-none rounded-sm w-5/6 py-2 px-3 leading-tight focus:outline-none focus:shadow-outline  ${
              isIdInvalid ? 'border border-red-500' : ''
            }`}
            pattern="^(?=.*.{24,})(?=.*PL).*"
            placeholder="ID or playlist URL. eg: 'www.youtube.com/playlist?list=PLi06ybkpczJBvFfOhfqDyKMl1Lp2tDkTb'"
            type="text"
            required
            onChange={(e) => handleChange(e)}
            value={playlistId}
          />
          <button
            className="  w-[13%] h-full bg-[#23036a] font-medium text-white  rounded-sm flex items-center justify-center"
            type="submit"
          >
            {isLoadingButton === true ? (
              <svg
                className="animate-spin mx-auto h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              'Play'
            )}
          </button>
        </div>
        {/* {isIdInvalid ? (
            <FormErrorMessage>
              THE ID OR URL IS NOT A VALID ONE{" "}
            </FormErrorMessage>
          ) : (
            <FormHelperText>ID or playlist URL</FormHelperText>
          )} */}
      </form>
    </div>
  );
}

Search.propTypes = {
  playlistDetails: PropTypes.arrayOf(
    PropTypes.shape({
      playlistName: PropTypes.string.isRequired,
      playlistId: PropTypes.string.isRequired,
      playlistImage: PropTypes.string.isRequired,
      playlistEtag: PropTypes.string.isRequired,
      currentIndex: PropTypes.number.isRequired,
    }),
  ).isRequired,
  player: PropTypes.shape({
    rememberLastVideo: PropTypes.bool.isRequired,
  }).isRequired,
  currentSong: PropTypes.func.isRequired,
  addToPlaylistDetails: PropTypes.func.isRequired,
  addSongsByPlaylistID: PropTypes.func.isRequired,
  playlistSongsById: PropTypes.objectOf(PropTypes.arrayOf).isRequired,
  setCurrentActivePlaylistId: PropTypes.func.isRequired,
  modifyEtagInPlaylistDetailsById: PropTypes.func.isRequired,
  isShuffleActive: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  playlistSongsById: state.playlistSongsById,
  playlistDetails: state.playlistDetails,
  player: state.player,
});

const mapDispatchToProps = {
  currentSong,
  addToPlaylistDetails,
  addSongsByPlaylistID,
  setCurrentActivePlaylistId,
  modifyEtagInPlaylistDetailsById,
  isShuffleActive,
  lastPlayedPlaylistDetails,
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
