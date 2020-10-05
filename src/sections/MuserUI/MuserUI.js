/** @jsx h */
const { h, Component } = require("preact");
const BaseComponent = require("../../components/BaseComponent/BaseComponent");
const classnames = require("classnames");
const animate = require("@jam3/gsap-promise");

const { player } = require("../../context");

const Button = require("../../components/Button/Button");
const IconButton = require("../../components/IconButton/IconButton");
const Header = require("../../components/Header/Header");
const GenreGraph = require("../../components/GenreGraph/GenreGraph");
const SeekBar = require("../../components/SeekBar/SeekBar");
const TrackSelector = require("../../components/TrackSelector/TrackSelector");

const formatTime = (seconds) => {
  if (seconds < 0) seconds = 0;
  if (seconds >= 60 * 10)
    return new Date(seconds * 1000).toISOString().substr(14, 5);
  return new Date(seconds * 1000).toISOString().substr(15, 4);
};

const getTrackPercentage = (currentTime, duration) => {
  if (currentTime < 0 || duration <= 0) return 0;
  return (100 * currentTime) / duration;
};

class MuserUI extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      isDashboardOpen: false,
      isPlaying: false,
      nowPlaying: player.getDefaultNowPlayingData(),
      currentTime: 0,
    };
  }

  componentDidMount() {
    // Update song data
    setInterval(() => {
      this.updateNowPlaying();
    }, 200);
  }

  animateIn() {
    return Promise.all([this.header.animateIn({ delay: 0.25 })]);
  }

  animateOut() {
    return Promise.all([this.header.animateOut()]);
  }

  updateNowPlaying() {
    const nowPlaying = player.getNowPlayingData();
    if (
      Math.floor(nowPlaying.currentTime) !=
      Math.floor(this.state.nowPlaying.currentTime)
    ) {
      this.setState({ nowPlaying });
    } else if (this.state.isPlaying) {
      this.setState({ currentTime: player.getCurrentTime() });
    }
  }

  handleToggleAudio = () => {
    if (this.state.isPlaying) player.pause();
    else player.play();

    this.setState({
      isPlaying: !this.state.isPlaying,
    });
  };

  handleSelectTrack = ({ target }) => {
    const trackId = target.value;
    player.switchTrack(trackId).then(() => {
      this.setState({
        isPlaying: false,
        nowPlaying: player.getDefaultNowPlayingData(),
        currentTime: 0,
      });
    });
  };

  handleToggleDashboard = () => {
    this.setState({
      isDashboardOpen: !this.state.isDashboardOpen,
    });
  };

  render() {
    const classes = classnames({
      Muser: true,
    });

    const { nowPlaying, currentTime, isPlaying } = this.state;

    return (
      <div
        className={classes}
        ref={(c) => {
          this.container = c;
        }}
      >
        <Header
          ref={(c) => {
            this.header = c;
          }}
        >
          Muser
        </Header>
        <div class="playlist">
          <TrackSelector
            tracks={player.playlist}
            onChange={this.handleSelectTrack}
          />
        </div>
        <div class="ui-wrapper">
          <div class="controls">
            <Button
              onClick={this.handleToggleAudio}
              ref={(c) => {
                this.button = c;
              }}
            >
              {isPlaying ? (
                <i class="material-icons">pause</i>
              ) : (
                <i class="material-icons">play_arrow</i>
              )}
            </Button>
            <div class="songInfo">
              <strong>{nowPlaying.title}</strong>
              <br />
              {nowPlaying.artist}
            </div>

            <div class="currentTime">
              {formatTime(nowPlaying.currentTime)} /{" "}
              {formatTime(nowPlaying.duration)}
            </div>
            <IconButton onClick={this.handleToggleDashboard}>
              <i class="material-icons">
                {this.state.isDashboardOpen
                  ? "insert_chart"
                  : "insert_chart_outlined"}
              </i>
            </IconButton>
          </div>

          <SeekBar
            value={getTrackPercentage(currentTime, nowPlaying.duration)}
          />
          {this.state.isDashboardOpen && (
            <GenreGraph genres={nowPlaying.topGenres} />
          )}
        </div>
      </div>
    );
  }
}

MuserUI.defaultProps = {
  onPlay: () => {},
};

module.exports = MuserUI;
