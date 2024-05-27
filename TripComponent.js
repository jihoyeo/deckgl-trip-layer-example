/* global window */
// React 및 필요한 모듈을 가져옵니다.
import React, { Component } from 'react';
import { render } from 'react-dom';
import { StaticMap } from 'react-map-gl';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import { PolygonLayer, ScatterplotLayer } from '@deck.gl/layers';
import { TripsLayer } from '@deck.gl/geo-layers';

// Mapbox 토큰을 설정합니다.
const MAPBOX_TOKEN = `pk.eyJ1Ijoic3BlYXI1MzA2IiwiYSI6ImNremN5Z2FrOTI0ZGgycm45Mzh3dDV6OWQifQ.kXGWHPRjnVAEHgVgLzXn2g`; // eslint-disable-line

// 데이터 URL을 설정합니다.
const DATA_URL = {
  BUILDINGS:
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/trips/buildings.json', // eslint-disable-line
  TRIPS:
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/trips/trips-v7.json', // eslint-disable-line
  POINTS:
    'https://raw.githubusercontent.com/pbeshai/deckgl-point-animation/master/src/data/libraries.json',
};

// 조명 설정을 정의합니다.
const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});

const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000],
});

const lightingEffect = new LightingEffect({ ambientLight, pointLight });

// 재질 설정을 정의합니다.
const material = {
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [60, 64, 70],
};

// 기본 테마 설정을 정의합니다.
const DEFAULT_THEME = {
  buildingColor: [74, 80, 87],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  material,
  effects: [lightingEffect],
};

// 초기 뷰 상태를 설정합니다.
const INITIAL_VIEW_STATE = {
  longitude: -74,
  latitude: 40.72,
  zoom: 13,
  pitch: 45,
  bearing: 0,
};

// 랜드 커버 데이터를 정의합니다.
const landCover = [
  [
    [-74.0, 40.7],
    [-74.02, 40.7],
    [-74.02, 40.72],
    [-74.0, 40.72],
  ],
];

// App 컴포넌트를 정의합니다.
// 상태(state)를 관리하는 객체
// 상태는 컴포넌트 내에서 동적으로 변경될 수 있는 데이터를 저장

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 0, // 애니메이션의 현재 시간을 저장합니다.
      last: {}, // fetch 요청을 통해 받아온 경로 데이터를 저장할 객체입니다.
    };
  }

  // 컴포넌트가 마운트될 때 데이터를 가져오고 애니메이션을 시작합니다.
  //데이터를 JSON 형식으로 변환한 후, findresponse 배열을 순회하며
  // 각 항목의 마지막 경로와 타임스탬프를 dict 객체에 저장합니다.
  componentDidMount() {
    // 데이터 URL로부터 데이터를 fetch합니다.
    fetch(DATA_URL.TRIPS)
      .then((response) => response.json()) // 응답을 JSON으로 변환합니다.
      .then((findresponse) => {
        // 변환된 데이터를 findresponse로 받습니다.
        const dict = {}; // 빈 객체를 생성합니다.
        let idx = 0; // 인덱스를 초기화합니다.
        findresponse.map((item) => {
          // 응답 배열을 순회합니다.
          var path = item.path[item.path.length - 1]; // 경로 데이터의 마지막 요소를 가져옵니다.
          var timestamp = item.timestamps[item.timestamps.length - 1]; // 타임스탬프 데이터의 마지막 요소를 가져옵니다.
          dict[idx] = [timestamp, path]; // dict 객체에 타임스탬프와 경로 데이터를 저장합니다.
          idx += 1; // 인덱스를 증가시킵니다.
        });
        // 상태를 업데이트하여 last에 dict 객체를 설정합니다.
        this.setState({
          last: dict,
        });
      });
    // 애니메이션을 시작합니다.
    this._animate();
  }

  // 컴포넌트가 언마운트될 때 애니메이션 프레임을 취소합니다.
  componentWillUnmount() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
    }
  }

  // 애니메이션을 실행합니다.
  _animate() {
    const {
      loopLength = 1800, // 애니메이션 루프의 총 길이 (타임스탬프 단위, 예: 1800초)
      animationSpeed = 60, // 애니메이션 속도 (초당 단위 시간, 예: 60초)
    } = this.props;

    // 현재 시간을 초 단위로 가져옵니다.
    const timestamp = Date.now() / 1000;

    // 루프의 총 시간을 계산합니다.
    // 예: loopLength가 1800이고 animationSpeed가 60이면, loopTime은 30초가 됩니다.
    const loopTime = loopLength / animationSpeed;

    // 상태를 업데이트하여 현재 애니메이션 시간을 설정합니다.
    // timestamp % loopTime: 현재 시간이 루프의 어느 시점에 있는지를 계산합니다.
    // (timestamp % loopTime) / loopTime: 루프 내의 현재 위치를 0과 1 사이의 비율로 변환합니다.
    // * loopLength: 비율을 전체 루프 길이로 변환하여 실제 애니메이션 시간으로 변환합니다.
    this.setState({
      time: ((timestamp % loopTime) / loopTime) * loopLength,
    });

    // requestAnimationFrame을 사용하여 다음 애니메이션 프레임을 요청합니다.
    // _animate 메서드를 재귀적으로 호출하여 애니메이션을 계속 실행합니다.
    this._animationFrame = window.requestAnimationFrame(
      this._animate.bind(this)
    );
  }

  // 레이어를 렌더링합니다.
  _renderLayers() {
    // props에서 필요한 데이터를 가져오고, 기본값을 설정합니다.
    const {
      buildings = DATA_URL.BUILDINGS, // 빌딩 데이터 URL
      trips = DATA_URL.TRIPS, // 트립 데이터 URL
      points = DATA_URL.POINTS, // 포인트 데이터 URL
      theme = DEFAULT_THEME, // 테마 설정
    } = this.props;

    // 애니메이션과 관련된 데이터를 저장할 배열을 초기화합니다.
    const arr = [];

    // 'last'라는 상태가 객체 타입인지 확인합니다.
    if (typeof this.state.last === 'object') {
      // 'last' 객체의 모든 키를 순회합니다.
      Object.keys(this.state.last).map((k, v) => {
        var timestamp = this.state.last[k][0]; // 타임스탬프를 가져옵니다.
        var path = this.state.last[k][1]; // 경로 데이터를 가져옵니다.

        // 현재 시간(state.time)이 타임스탬프보다 크거나 같으면 배열에 경로를 추가합니다.
        if (this.state.time >= timestamp) {
          arr.push(path);
        }
      });
    }

    // 레이어를 반환합니다.
    return [
      // 그림자 효과를 사용할 때 필요한 기본 폴리곤 레이어입니다.
      new PolygonLayer({
        id: 'ground',
        data: landCover, // 랜드 커버 데이터를 설정합니다.
        getPolygon: (f) => f, // 폴리곤 데이터를 가져오는 함수입니다.
        stroked: false, // 외곽선을 그리지 않습니다.
        getFillColor: [0, 0, 0, 0], // 채우기 색상을 투명으로 설정합니다.
      }),
      // 트립 레이어입니다.
      new TripsLayer({
        id: 'trips',
        data: trips, // 트립 데이터를 설정합니다.
        getPath: (d) => d.path, // 각 트립의 경로를 가져오는 함수입니다.
        getTimestamps: (d) => d.timestamps, // 각 트립의 타임스탬프를 가져오는 함수입니다.
        getColor: (d) =>
          d.vendor === 0 ? theme.trailColor0 : theme.trailColor1, // 벤더에 따라 트레일 색상을 설정합니다.
        opacity: 0.3, // 투명도를 설정합니다.
        widthMinPixels: 5, // 최소 너비를 설정합니다.
        rounded: true, // 경로를 둥글게 설정합니다.
        trailLength: 5, // 트레일 길이를 설정합니다.
        currentTime: this.state.time, // 현재 애니메이션 시간을 설정합니다.
        shadowEnabled: false, // 그림자 효과를 비활성화합니다.
      }),
      // 빌딩 레이어입니다.
      new PolygonLayer({
        id: 'buildings',
        data: buildings, // 빌딩 데이터를 설정합니다.
        extruded: true, // 빌딩을 3D로 설정합니다.
        wireframe: false, // 와이어프레임을 비활성화합니다.
        opacity: 0.5, // 투명도를 설정합니다.
        getPolygon: (f) => f.polygon, // 빌딩의 폴리곤 데이터를 가져오는 함수입니다.
        getElevation: (f) => f.height, // 빌딩의 높이를 가져오는 함수입니다.
        getFillColor: theme.buildingColor, // 빌딩 색상을 테마에 맞게 설정합니다.
        material: theme.material, // 빌딩 재질을 테마에 맞게 설정합니다.
      }),
      // 스캐터플롯 레이어입니다.
      new ScatterplotLayer({
        id: 'scatterplot',
        data: arr, // 서버에서 데이터를 로드한 배열을 설정합니다.
        getPosition: (d) => [d[0], d[1]], // 각 포인트에서 경도 및 위도를 가져오는 함수입니다.
        getColor: (d) => [255, 255, 255], // 포인트 색상을 흰색으로 설정합니다.
        getRadius: (d) => 25, // 포인트 반경을 설정합니다.
        opacity: 0.9, // 투명도를 설정합니다.
        pickable: false, // 포인트를 선택할 수 없게 설정합니다.
        radiusMinPixels: 3, // 포인트의 최소 반경을 설정합니다.
        radiusMaxPixels: 30, // 포인트의 최대 반경을 설정합니다.
      }),
    ];
  }

  // 컴포넌트를 렌더링합니다.
  render() {
    const {
      viewState,
      mapStyle = 'mapbox://styles/spear5306/ckzcz5m8w002814o2coz02sjc',
      theme = DEFAULT_THEME,
    } = this.props;

    return (
      <DeckGL
        layers={this._renderLayers()}
        effects={theme.effects}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        controller={true}
      >
        <StaticMap
          reuseMaps
          mapStyle={mapStyle}
          preventStyleDiffing={true}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        />
      </DeckGL>
    );
  }
}

// DOM에 렌더링하는 함수를 정의합니다.
export function renderToDOM(container) {
  render(<App />, container);
}
