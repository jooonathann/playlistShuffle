import React, { useEffect, useRef, useState } from "react";
import VideoCard from "../VideoCard/VideoCard";
import MediaButtons from "../MediaButtons/MediaButtons";
import {
  PLAYER_ISPLAYING,
  PLAYER_ISSHUFFLEACTIVE,
  PLAYER_CURRENTSONG,
  PLAYER_ISLOOPACTIVE,
  PLAYER_NEXTSONG,
  PLAYER_PREVIOUSSONG,
} from "../../constants/playerTypes";
import PlayingRightNow from "../PlayingRightNow/PlayingRightNow";
import Navbar from "../Navbar/Navbar";
import PlaylistInfo from "../PlaylistInfo/PlaylistInfo";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import HelmetHelper from "../Helmet/HelmetHelper";
import Player from "../Player/Player";
const PlaylistPage = ({
  isPlaying,
  player,
  isLoopActive,
  isShuffleActive,
  currentSong,
  previousSong,
  nextSong,
  playlistSongsById,
}) => {
  const [currentSongName, setCurrentSongName] = useState("");
  const { id } = useParams();
  const ref = useRef(null);

  useEffect(() => {
    const songIndex = playlistSongsById[
      player.currentActivePlaylistId
    ].findIndex((song) => {
      return song.snippet.resourceId.videoId === player.currentSong;
    });
    setCurrentSongName(
      playlistSongsById[player.currentActivePlaylistId][songIndex].snippet.title
    );
  }, [player.currentSong]);

  useEffect(() => {
    const handleClick = (e) => {
      switch (e.code) {
        case "Space": {
          isPlaying(player.isPlaying === true ? false : true);
          break;
        }
        case "KeyR": {
          isLoopActive(player.isLoopActive === true ? false : true);
          break;
        }
        case "KeyS": {
          isShuffleActive(player.isShuffleActive === true ? false : true);
          break;
        }
        case "ArrowLeft": {
          const currIndex = playlistSongsById[
            player.currentActivePlaylistId
          ].findIndex((song) => {
            return song.snippet.resourceId.videoId === player.currentSong;
          });
          if (currIndex !== 0) {
            previousSong(
              playlistSongsById[player.currentActivePlaylistId][currIndex - 2]
                ?.snippet.resourceId.videoId
            );

            nextSong(
              playlistSongsById[player.currentActivePlaylistId][currIndex]
                ?.snippet.resourceId.videoId
            );
            currentSong(
              playlistSongsById[player.currentActivePlaylistId][currIndex - 1]
                ?.snippet.resourceId.videoId
            );
          }
          break;
        }
        case "ArrowRight": {
          const currIndex = playlistSongsById[
            player.currentActivePlaylistId
          ].findIndex((ele) => {
            return ele.snippet?.resourceId.videoId === player.currentSong;
          });

          if (
            currIndex <
            playlistSongsById[player.currentActivePlaylistId].length - 1
          ) {
            previousSong(
              playlistSongsById[player.currentActivePlaylistId][currIndex]
                ?.snippet.resourceId.videoId
            );
            currentSong(
              playlistSongsById[player.currentActivePlaylistId][currIndex + 1]
                ?.snippet.resourceId.videoId
            );
            nextSong(
              playlistSongsById[player.currentActivePlaylistId][currIndex + 2]
                ?.snippet.resourceId.videoId
            );
          } else if (
            currIndex ===
            playlistSongsById[player.currentActivePlaylistId].length - 1
          ) {
            console.log("No more songs left");
          }
          break;
        }
      }
    };

    const element = ref.current;

    element.addEventListener("keydown", handleClick, { passive: true });

    return () => {
      element.removeEventListener("keydown", handleClick, { passive: true });
    };
  }, [player]);

  // const PlaylistInfo = lazy(() => import("../PlaylistInfo/PlaylistInfo"))

  return (
    <div
      ref={ref}
      passive="true"
      // tabIndex={0}
      className="min-h-screen bg-slate-800 w-full"
      // w="100%"
      // h={"100vh"}
      // maxWidth="1866px"
    >
      <div className="w-[95%] mx-auto">
        <HelmetHelper
          title={
            currentSongName
              ? `${currentSongName} - Playlist Shuffle`
              : "Paylist Shuffle | randomize your playlist"
          }
        />
        <Navbar />

        <div
          className=" "
          //  justify={["center", "center", "left", "left"]} mb={"1.5"}
        >
          <PlaylistInfo />
        </div>

        <div
          className="div"
          // w={["98%", "98%", "98%", "95%"]}
          // m={"0 auto"}
          // display={"flex"}
          // justifyContent={"center"}
        >
          <div
            className="mainContent lg:flex"
            // h={["100%", "100%", "65vh", "65vh", "65vh", "65vh"]}
            // maxH={"1900px"}
            // flexDirection={["column", "column", "row"]}
            // alignItems={["center", "center", "center", "inherit"]}
            // w={"100%"}
          >
            <div
            // w={["100%", "100%", "40%", "40%"]}
            // h={["30vh", "30vh", "100%", "100%"]}
            // maxH={"1900px"}
            className="lg:w-2/5"
            >
              <Player />
            </div>
            <div
            className=" h-3/5 mt-6 w-[97%]  lg:mt-0 mx-auto lg:w-[55%]"
            // mt={["10px", "10px", "0", "0"]}
            // w={["100%", "100%", "100%", "50%"]}
            // h={["100%", "100%", "100%", "100%"]}
            // maxH={"1900px"}
            >
              <VideoCard />
            </div>
          </div>
          <div
            className="bottomMedia bg-[#bb86fc] fixed bottom-0 left-0 right-0"
            // minW={"100%"}
            // position={"fixed"}
            // bottom={"0"}
            // h={["18%", "14%"]}
            // left={"0"}
            // bg={"red.100"}
            // display={"flex"}
            // pt={["1", "1", "5"]}
            // pb={[null, null, "2"]}
            // flexDirection={["column", "column", "row", "row"]}
            // justifyContent={["center"]}
          >
            <div>
              <PlayingRightNow />
            </div>
            <div
              // justify={"center"}
              // alignItems={"center"}
              className="mediaButtonsContainer flex justify-center"
            >
              <MediaButtons />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    isPlaying: (payload) => dispatch({ type: PLAYER_ISPLAYING, payload }),
    isLoopActive: (payload) => dispatch({ type: PLAYER_ISLOOPACTIVE, payload }),
    isShuffleActive: (payload) =>
      dispatch({ type: PLAYER_ISSHUFFLEACTIVE, payload }),
    previousSong: (payload) => dispatch({ type: PLAYER_PREVIOUSSONG, payload }),
    currentSong: (payload) => dispatch({ type: PLAYER_CURRENTSONG, payload }),
    nextSong: (payload) => dispatch({ type: PLAYER_NEXTSONG, payload }),
  };
};

const mapStateToProps = (state) => {
  return {
    songs: state.songs,
    player: state.player,
    playlistSongsById: state.playlistSongsById,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistPage);
