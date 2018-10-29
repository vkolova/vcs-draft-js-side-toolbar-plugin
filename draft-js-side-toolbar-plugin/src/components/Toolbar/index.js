/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import DraftOffsetKey from 'draft-js/lib/DraftOffsetKey';
import {
  HeadlineOneButton,
  HeadlineTwoButton,
  BlockquoteButton,
  CodeBlockButton,
  UnorderedListButton,
  OrderedListButton,
} from 'draft-js-buttons';
import BlockTypeSelect from '../BlockTypeSelect';

class Toolbar extends React.Component {

  static defaultProps = {
    children: (externalProps) => (
      // may be use React.Fragment instead of div to improve perfomance after React 16
      <div>
        <HeadlineOneButton {...externalProps} />
        <HeadlineTwoButton {...externalProps} />
        <BlockquoteButton {...externalProps} />
        <CodeBlockButton {...externalProps} />
        <UnorderedListButton {...externalProps} />
        <OrderedListButton {...externalProps} />
      </div>
    )
  }

  state = {
    position: {
      transform: 'scale(0)',
    }
  }

  popupRef = React.createRef();

  componentDidMount() {
    this.props.store.subscribeToItem('editorState', this.onEditorStateChange);
    this.setScrollEventListeners();
  }

  componentWillUnmount() {
    this.props.store.unsubscribeFromItem('editorState', this.onEditorStateChange);
    this.removeScrollEventListeners();
  }

  componentDidUpdate (prevProps) {
    if (prevProps.scrollParent !== this.props.scrollParent) {
      this.removeScrollEventListeners();
      this.setScrollEventListeners();
    }
  }

  onScrollParent = () => {
    this.state.position.transform !== 'scale(0)' && this.setState({
      position: {
        transform: 'scale(0)'
      }
    });
  }

  withScrollParent (callback) {
    const scrollParent = this.props.scrollParent &&
      document.querySelectorAll(this.props.scrollParent)[0];
    scrollParent && scrollParent.firstChild &&
      callback(scrollParent.firstChild);
  }

  setScrollEventListeners () {
    this.withScrollParent(p => p.addEventListener('scroll', this.onScrollParent));
  }

  removeScrollEventListeners () {
    this.withScrollParent(p => p.removeEventListener('scroll', this.onScrollParent));
  }

  onEditorStateChange = (editorState) => {
    const selection = editorState.getSelection();

    if (!selection.getHasFocus() && !selection.count()) {
      this.setState({
        position: {
          transform: 'scale(0)',
        },
      });
      return;
    }

    const currentContent = editorState.getCurrentContent();
    const currentBlock = currentContent.getBlockForKey(selection.getStartKey());
    // TODO verify that always a key-0-0 exists
    const offsetKey = DraftOffsetKey.encode(currentBlock.getKey(), 0, 0);
    // Note: need to wait on tick to make sure the DOM node has been create by Draft.js
    setTimeout(() => {
      const node = document.querySelectorAll(`[data-offset-key="${offsetKey}"]`)[0];

      // The editor root should be two levels above the node from
      // `getEditorRef`. In case this changes in the future, we
      // attempt to find the node dynamically by traversing upwards.
      const editorRef = this.props.store.getItem('getEditorRef')();
      if (!editorRef) return;

      // this keeps backwards-compatibility with react 15
      let editorRoot = editorRef.refs && editorRef.refs.editor
        ? editorRef.refs.editor : editorRef.editor;
      while (editorRoot.className.indexOf('DraftEditor-root') === -1) {
        editorRoot = editorRoot.parentNode;
      }

      const topWithNoScroll = node.offsetTop + editorRoot.offsetTop;

      let valueTop = 0;
      if (this.props.scrollParent) {
        const scrollParent = document.querySelectorAll(this.props.scrollParent)[0];

        let element = node;
        do {
          valueTop += element.scrollTop || 0;
          element = element.parentNode;
        } while (element && element !== scrollParent);
      }

      const position = {
        top: (topWithNoScroll > valueTop) ? topWithNoScroll - valueTop: 0,
        transform: 'scale(1)',
        transition: 'transform 0.15s cubic-bezier(.3,1.2,.2,1)',
      };
      // TODO: remove the hard code(width for the hover element)
      if (this.props.position === 'right') {
        // eslint-disable-next-line no-mixed-operators
        position.left = editorRoot.offsetLeft + editorRoot.offsetWidth + 80 - 36;
      } else {
        position.left = editorRoot.offsetLeft - 80;
      }

      this.setState({
        position,
      });
    }, 0);
  }

  onOverrideContent(overrideContent) {
    this.popupRef.onOverrideContent(overrideContent);
  }

  render() {
    const { theme, store, wrapperIcon } = this.props;

    return (
      <div
        className={theme.toolbarStyles.wrapper}
        style={this.state.position}
      >
        <BlockTypeSelect
          getEditorState={store.getItem('getEditorState')}
          setEditorState={store.getItem('setEditorState')}
          theme={theme}
          wrapperIcon={wrapperIcon}
          ref={this.popupRef}
        >
          {this.props.children}
        </BlockTypeSelect>
      </div>
    );
  }
}

Toolbar.propTypes = {
  children: PropTypes.func,
  wrapperIcon: PropTypes.node
};

export default Toolbar;
