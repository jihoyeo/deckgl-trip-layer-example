// React 및 필요한 모듈을 가져옵니다.
import React, { Component } from 'react';
// ReactDOM을 사용하여 컴포넌트를 렌더링합니다.
import { render } from 'react-dom';
// TripComponent를 가져옵니다. 이 컴포넌트는 별도로 정의되어 있어야 합니다.
import TripComponent from './TripComponent';
// CSS 스타일을 가져옵니다.
import './style.css';

// App 클래스 컴포넌트를 정의합니다. 이 컴포넌트는 React의 Component 클래스를 상속받습니다.
class App extends Component {
  // 생성자 메서드를 정의합니다. 초기 상태를 설정합니다.
  constructor() {
    super();
    // state 객체에 name 속성을 'React'로 초기화합니다.
    this.state = {
      name: 'React',
    };
  }

  // render 메서드는 컴포넌트가 렌더링될 때 호출됩니다.
  render() {
    return (
      // JSX를 사용하여 컴포넌트를 렌더링합니다.
      <div>
        {/* TripComponent를 렌더링하고, props로 name 속성을 전달합니다. */}
        <TripComponent name={this.state.name} />
      </div>
    );
  }
}

// render 함수를 사용하여 App 컴포넌트를 HTML 요소(여기서는 id가 'root'인 요소)에 렌더링합니다.
render(<App />, document.getElementById('root'));
