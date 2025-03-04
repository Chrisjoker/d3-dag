// Create a dag from a hierarchy representation
import Node from ".";
import verify from "./verify";

export default function() {
  let id = defaultId;
  let children = defaultChildren;
  let linkData = defaultLinkData;

  function dagHierarchy(...data) {
    if (!data.length) {
      throw new Error("must pass at least one node");
    }
    const mapping = {};
    const queue = [];

    function nodify(datum) {
      const did = id(datum).toString();
      let res;
      if (!(res = mapping[did])) {
        res = new Node(did, datum);
        queue.push(res);
        mapping[did] = res;
      } else if (!isEquivalent(datum, res.data)) {
        throw new Error("found a duplicate id: " + did);
      }
      return res;
    }

    function isEquivalent(a, b) {
      const aProps = Object.keys(a);
      const bProps = Object.keys(b);
      if (aProps.length !== bProps.length) {
        return false;
      }
      for (let i = 0; i < aProps.length; i++) {
        if (aProps[i] !== bProps[i]) {
          return false;
        }
      }
      return true;
    }

    const root = new Node(undefined, undefined);
    let node;
    root.children = data.map(nodify);
    while ((node = queue.pop())) {
      node.children = (children(node.data) || []).map(nodify);
      node._childLinkData = node.children.map((c) =>
        linkData(node.data, c.data)
      );
    }

    verify(root);
    return root.children.length > 1 ? root : root.children[0];
  }

  dagHierarchy.id = function(x) {
    return arguments.length ? ((id = x), dagHierarchy) : id;
  };

  dagHierarchy.children = function(x) {
    return arguments.length ? ((children = x), dagHierarchy) : children;
  };

  dagHierarchy.linkData = function(x) {
    return arguments.length ? ((linkData = x), dagHierarchy) : linkData;
  };

  return dagHierarchy;
}

function defaultId(d) {
  return d.id;
}

function defaultChildren(d) {
  return d.children;
}

function defaultLinkData() {
  return {};
}
