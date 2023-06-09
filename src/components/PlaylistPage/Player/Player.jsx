import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import ReactPlayer from 'react-player/youtube';
import PropTypes from 'prop-types';
import screenfull from 'screenfull';

import {
  isPlaying,
  currentSong,
  setProgress,
  setVideoDuration,
  isFullScreenActive,
  setPercentage,

} from '../../../redux/actions/playerActions';
import { lastPlayedPlaylistDetails } from '../../../redux/actions/playlistDetailsActions';

function Player({
  player,
  isPlaying,
  currentSong,
  playlistSongsById,
  setVideoDuration,
  setProgress,
  setPercentage,
  isFullScreenActive,
  lastPlayedPlaylistDetails,
  playlistDetails,
}) {
  const playerRef = useRef(null);

  const findPlaylistIndex = playlistDetails.findIndex(
    (element) => element.playlistId === player.currentActivePlaylistId,
  );

  useEffect(() => {
    if (player.isFullScreenActive === true) {
      if (screenfull.isEnabled) {
        screenfull.request(playerRef.current.wrapper.childNodes[0].children[0]);
      }
      isFullScreenActive(false);

      // screenfull.exit()
    }
  }, [player.isFullScreenActive]);

  useEffect(() => {
    // if (playlistSongsById[player.currentActivePlaylistId]) {
    if (player.rememberLastVideo) {
      currentSong(
        playlistSongsById[player.currentActivePlaylistId][
          playlistDetails[findPlaylistIndex].currentIndex
        ]?.snippet.resourceId.videoId,
      );
    } else {
      currentSong(
        playlistSongsById[player.currentActivePlaylistId][0]?.snippet
          .resourceId.videoId,
      );
    }
  }, []);

  const afterSongEnds = () => {
    const currIndex = playlistDetails[findPlaylistIndex].currentIndex;
    if (
      playlistDetails[findPlaylistIndex].currentIndex
      < playlistSongsById[player.currentActivePlaylistId].length - 1
    ) {
      if (player.rememberLastVideo === true) {
        const lastPlayedObj = {
          currentIndex: playlistDetails[findPlaylistIndex].currentIndex + 1,
          playlistId: player.currentActivePlaylistId,
        };
        lastPlayedPlaylistDetails(lastPlayedObj);
      }
      currentSong(
        playlistSongsById[player.currentActivePlaylistId][currIndex + 1]
          ?.snippet.resourceId.videoId,
      );
    } else if (playlistDetails[findPlaylistIndex].currentIndex
      === playlistSongsById[player.currentActivePlaylistId].length - 1) {
      // eslint-disable-next-line
      console.log('No more songs left');
    }
  };

  const handleEnd = () => {
    if (
      playlistDetails[findPlaylistIndex].currentIndex
      === playlistSongsById[player.currentActivePlaylistId].length
    ) {
      // eslint-disable-next-line
      console.log('Playlist Ended');
      isPlaying(false);
    } else {
      afterSongEnds();
    }
  };
  // When some songs can't be played outside of youtube this function will trigger
  // and playlist the next song, or if it is the last the playlist will end
  const handleError = () => {
    const currIndex = playlistDetails[findPlaylistIndex].currentIndex;
    // eslint-disable-next-line
    if (
      currIndex
      === playlistDetails[findPlaylistIndex].playlistLength
    ) {
      // eslint-disable-next-line
      console.log('Playlist Ended');
      isPlaying(false);
    } else afterSongEnds();
  };

  const handlePlay = () => {
    isPlaying(true);
  };
  const handlePause = () => {
    isPlaying(false);
  };

  const handleReady = () => {
    isPlaying(true);
  };
  const getPercentage = (a, b) => {
    const trimmedA = Math.floor(a);
    const percentage = (trimmedA / b) * 100;
    setPercentage(String(Math.floor(percentage)));
  };

  const handleProgress = (e) => {
    setProgress(String(Math.floor(e.playedSeconds)));
    getPercentage(String(e.playedSeconds), String(player.videoDuration));
  };
  const handleDuration = (e) => {
    setVideoDuration(String(e));
  };

  return (
    <div className="player aspect-auto md:w-full md:h-full">
      {/* https://img.youtube.com/vi/Eeb4aZObp-0/0.jpg */}
      <ReactPlayer
        playing={player.isPlaying}
        ref={playerRef}
        // not working yet
        // fallback={`https://img.youtube.com/vi/${player.currentSong}.jpg`}
        volume={null}
        muted={player.isMutedActive}
        passive="true"
        onProgress={(e) => handleProgress(e)}
        onDuration={(e) => handleDuration(e)}
        onError={() => handleError()}
        onPlay={() => handlePlay()}
        onPause={() => handlePause()}
        onReady={() => handleReady()}
        onEnded={() => handleEnd()}
        width="100%"
        height="100%"
        controls
        loop={player.isLoopActive}
        url={`https://www.youtube.com/embed/${player.currentSong}`}
      />
    </div>
  );
}

Player.propTypes = {
  player: PropTypes.shape({
    isPlaying: PropTypes.bool.isRequired,
    currentSong: PropTypes.string.isRequired,
    isShuffleActive: PropTypes.bool.isRequired,
    isLoopActive: PropTypes.bool.isRequired,
    currentActivePlaylistId: PropTypes.string.isRequired,
    isMutedActive: PropTypes.bool.isRequired,
    rememberLastVideo: PropTypes.bool.isRequired,
    isFullScreenActive: PropTypes.bool.isRequired,
    videoDuration: PropTypes.string.isRequired,

  }).isRequired,
  playlistDetails: PropTypes.arrayOf(PropTypes.shape({
    playlistName: PropTypes.string.isRequired,
    playlistId: PropTypes.string.isRequired,
    playlistImage: PropTypes.string.isRequired,
    playlistEtag: PropTypes.string.isRequired,
    currentIndex: PropTypes.number.isRequired,
    playlistLength: PropTypes.number.isRequired,

  })).isRequired,
  isPlaying: PropTypes.func.isRequired,
  currentSong: PropTypes.func.isRequired,
  setPercentage: PropTypes.func.isRequired,
  playlistSongsById: PropTypes.objectOf(PropTypes.arrayOf).isRequired,
  setProgress: PropTypes.func.isRequired,
  setVideoDuration: PropTypes.func.isRequired,
  isFullScreenActive: PropTypes.func.isRequired,
  lastPlayedPlaylistDetails: PropTypes.func.isRequired,

};

const mapDispatchToProps = {
  isPlaying,
  currentSong,
  setProgress,
  setVideoDuration,
  setPercentage,
  isFullScreenActive,
  lastPlayedPlaylistDetails,
};

const mapStateToProps = (state) => ({
  player: state.player,
  playlistSongsById: state.playlistSongsById,
  playlistDetails: state.playlistDetails,
});

export default connect(mapStateToProps, mapDispatchToProps)(Player);
