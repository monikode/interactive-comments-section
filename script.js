let comments = [];
let currentUser = {};
let lastIdCreated = 0;

function getData() {
  var dataJson = new XMLHttpRequest();
  dataJson.overrideMimeType("application/json");
  dataJson.open("GET", "data.json", true);
  dataJson.onreadystatechange = function () {
    if (dataJson.readyState === 4 && dataJson.status == "200") {
      const response = JSON.parse(dataJson.responseText);
      comments = response.comments;
      currentUser = response.currentUser;
      loadComments(document.getElementById("root"), comments);
    }
  };
  dataJson.send(null);
}

function loadComments(element, list) {
  element.innerHTML = "";

  list.forEach((item) => {
    if (item.id >= lastIdCreated) {
      lastIdCreated = item.id + 1;
    }

    const li = document.createElement("li");
    element.append(li);

    if (item.editMode === true) {
      li.append(editReplyElement(item));
    } else {
      const avatar = document.createElement("img");
      avatar.src = "assets/" + item.user.image.png;
      const actions = document.createElement("div");

      if (item.user.username == currentUser.username) {
        const buttonEdit = document.createElement("button");
        buttonEdit.innerText = "Edit";
        buttonEdit.onclick = () => {
          item.editMode = true;
          loadComments(document.getElementById("root"), comments);
        };
        const buttonDelete = document.createElement("button");
        buttonDelete.innerText = "Delete";
        buttonDelete.onclick = () => {
          comments = deleteComment(item.id, comments);
          loadComments(document.getElementById("root"), comments);
        };
        actions.append(buttonEdit);
        actions.append(buttonDelete);
      } else {
        const buttonReply = document.createElement("button");
        buttonReply.innerText = "Reply";
        buttonReply.onclick = () => {
          activeReply(li, item);
        };
        actions.append(buttonReply);
      }
      const content = document.createElement("div");
      content.innerText = item.content;

      const replyArea = document.createElement("div");
      replyArea.classList.add("reply-area");

      li.append(avatar);
      li.append(actions);
      li.append(content);
      li.append(replyArea);

      if (item.replies && item.replies.length > 0) {
        const ul = document.createElement("ul");
        li.append(ul);
        loadComments(ul, item.replies);
      }
    }
  });
}

const activeReply = (element, comment) => {
  const replyArea = element.lastElementChild;
  if (replyArea.childNodes.length === 0) {
    const textarea = document.createElement("textarea");
    replyArea.append(textarea);
    const buttonSend = document.createElement("button");
    buttonSend.innerText = "Send";
    buttonSend.onclick = () => {
      addReply(comment.id, comments, textarea.value);
      replyArea.innerHTML = "";
    };
    replyArea.append(buttonSend);
  } else {
    alert("ja tem");
  }
};

function addReply(commentId, list, text) {
  list.forEach((item) => {
    if (item.id == commentId) {
      item.replies = item.replies ?? [];
      item.replies.push({
        id: lastIdCreated,
        content: text,
        createdAt: "1 month ago",
        score: 0,
        user: currentUser,
        replies: [],
      });
      lastIdCreated++;
      loadComments(document.getElementById("root"), comments);
    } else {
      if (item.replies) {
        addReply(commentId, item.replies, text);
      }
    }
  });
}

function editComment(comment, list) {
  list = list.map((item) => {
    if (item.id == comment.id) {
      return comment;
    } else {
      if (item.replies) {
        return {
          ...item,
          replies: editComment(comment, item.replies),
        };
      }

      return item;
    }
  });

  return list;
}

function editReplyElement(comment) {
  const replyArea = document.createElement("div");
  const textArea = document.createElement("textarea");
  textArea.value = comment.content;

  const buttonSend = document.createElement("button");
  buttonSend.innerText = "Send";
  buttonSend.onclick = () => {
    comment.content = textArea.value;
    comment.editMode = false;
    loadComments(
      document.getElementById("root"),
      editComment(comment, comments)
    );
  };

  replyArea.append(textArea);
  replyArea.append(buttonSend);
  return replyArea;
}

const deleteComment = (commentId, list) => {
  console.log(commentId);
  list = list.filter((it) => it.id != commentId);

  list = list.map((item) => {
    if (item.replies) {
      return {
        ...item,
        replies: deleteComment(commentId, item.replies),
      };
    }

    return item;
  });

  return list;
};
document.addEventListener("DOMContentLoaded", function (e) {
  getData();
});
