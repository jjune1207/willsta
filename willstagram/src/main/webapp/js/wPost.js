function post_write() {
	var postno = 0;
	var formData = new FormData();

	var paramArray = $('#postWrite').serializeArray();

	for (var i = 0; i < paramArray.length; i++) {
		if (paramArray[i].name == 'pNo' && paramArray[i].value > 0) {
			postno = paramArray[i].value;
		}
		formData.append(paramArray[i].name, paramArray[i].value);
	}

	var inputFile = $("input[name='file1']");
	var files = inputFile[0].files;
	for (var i = 0; i < files.length; i++) {
		formData.append("uploadFile", files[i]);
	}

	$.ajax({
		url : 'write_post',
		processData : false, // k:v 방식으로 전달
		contentType : false, // file전송을 위해서는 false로 줘야 한다.
		data : formData,
		type : "POST",
		dataType : 'html',
		success : function(resultText) {
			if (postno > 0) {
				$('div.post-bar[post_no="' + postno + '"]').remove();
			}
			$('div.posts-section').prepend(resultText);
		}

	});

	$(".post-popup.job_post").removeClass("active");
	$(".wrapper").removeClass("overlay");

};

// document ready
$(function() {
	// post쓰기
	$('#postWrite').validate({
		rules : {
			pTitle : {
				required : true,
				maxlength : 80
			},
			hasTag : {
				required : true,
				maxlength : 80
			},
			pContents : {
				required : true,
				maxlength : 2000
			}
		},
		submitHandler : function() {
			// 유효성을 통과하면 호출
			post_write();
		},
		errorClass : "error",
		validClass : "valid"
	});

	// post삭제
	$(document).on('click', 'ul.ed-options a.deletePost', function(e) {
		var $post = $(e.target).parents('div.post-bar');
		var params = "pNo=" + $post.attr('post_no');
		$.ajax({
			url : 'delete_post',
			method : 'POST',
			data : params,
			dataType : 'text',
			success : function(resultText) {
				if (resultText.trim() == 'success') {
					$post.remove();
				} else {
					alert('delete fail');
				}
			}
		});
		e.preventDefault();
	});

	// 수정 폼 호출:쓰기폼을 보여주고 데이터를 뿌려준다
	$(document).on("click", ".updatePost", function(e) {

		var $post = $(e.target).parents('div.post-bar');
		var params = "pNo=" + $post.attr('post_no');

		$.ajax({
			url : 'get_post_data',
			method : 'POST',
			data : params,
			dataType : 'json',
			success : function(jsonObject) {
				postWrite.pNo.value = jsonObject.pNo;
				postWrite.pTitle.value = jsonObject.pTitle;
				postWrite.hasTag.value = jsonObject.hasTag;
				postWrite.pContents.value = jsonObject.pContents;
			}
		});

		$(".post-popup.job_post").addClass("active");
		$(".wrapper").addClass("overlay");
	});

	// 추가post가져오기
	$(document).on("click", ".spinner", function(e) {
		var $post = $("div.post-bar").last();
		var params = "lastpNo=" + $post.attr('post_no');
		$.ajax({
			url : 'add_post',
			method : 'POST',
			data : params,
			dataType : 'html',
			success : function(resultText) {
				$('div.posts-section').append(resultText);
			}
		});
		e.preventDefault();
	});

	// 스크롤이벤트 : 문서의 끝 위치에 오면 post 추가 조회
	$(window).on(
			"scroll",
			function(e) {
				// 문서의높이에 윈도우높이를 제외한 값이 스크롤의 최대값이다
				if (($(document).height() - $(window).height()) != $(document)
						.scrollTop()) {
					return;
				}
				var $post = $("div.post-bar").last();
				var params = "lastpNo=" + $post.attr('post_no');
				$.ajax({
					url : 'add_post',
					method : 'POST',
					data : params,
					dataType : 'html',
					success : function(resultText) {
						$('div.posts-section').append(resultText);
					}
				});
				e.preventDefault();
			});

	// post숨기거나 보이기
	$(document).on(
			'click',
			'ul.ed-options a.hiddenPost',
			function(e) {
				var $post = $(e.target).parents('div.post-bar');
				var params = "pNo=" + $post.attr('post_no') + "&status="
						+ $(e.target).text();
				$.ajax({
					url : 'status_change',
					method : 'POST',
					data : params,
					dataType : 'text',
					success : function(resultText) {
						if (resultText.trim() == 'success') {
							if ($(e.target).text() == 'Hide') {
								$(e.target).text('Show');
							} else {
								$(e.target).text('Hide');
							}

						} else {
							alert('change fail');
						}
					}
				});
				e.preventDefault();
			});

	// 컨텐츠 보기 detail
	$(document).on('click', 'div.job_descp a', function(e) {
		var $post = $(e.target).parents('div.post-bar');
		var params = "pNo=" + $post.attr('post_no');
		$.ajax({
			url : 'get_post',
			method : 'POST',
			data : params,
			dataType : 'text',
			success : function(resultText) {
				$('div.post_deatil').html(resultText);
				$('div.post_deatil').addClass("active");
				$(".wrapper").addClass("overlay");
			}
		});
		e.preventDefault();
	});

	// Top Views를 통해 컨텐츠 보기 detail
	$(document).on('click', '.job-info a', function(e) {
		var $post = $(e.target).parents('.job-info');
		var params = "pNo=" + $post.attr('post_no');
		$.ajax({
			url : 'get_post',
			method : 'POST',
			data : params,
			dataType : 'text',
			success : function(resultText) {
				$('div.post_deatil').html(resultText);
				$('div.post_deatil').addClass("active");
				$(".wrapper").addClass("overlay");
			}
		});
		e.preventDefault();
	});

	$(document).on('click', 'button.btn-default', function(e) {
		$('div.post_deatil').removeClass("active");
		$(".wrapper").removeClass("overlay");
		e.preventDefault();
	});

	// 좋아유 추가
	$(document).on(
			'click',
			'ul.like-com a.like',
			function(e) {
				var $post = $(e.target).parents('div.post-bar');
				var params = "pNo=" + $post.attr('post_no');
				$.ajax({
					url : 'insert_like',
					data : params,
					type : "POST",
					dataType : 'text',
					success : function(resultText) {
						var likeCount = $(e.target).siblings('span.likeCount')
								.text();
						if (resultText.trim() == 'insert') {
							$(e.target).siblings('span.likeCount').text(
									Number(likeCount) + 1);
							$(e.target).addClass("active");
						} else if (resultText.trim() == 'delete') {
							$(e.target).siblings('span.likeCount').text(
									Number(likeCount) - 1);
							$(e.target).removeClass("active");
						}
					}

				});
				e.preventDefault();
			});

	var sel_files = [];
	$(document).on(
			'change',
			'input.TXTFLD',
			function(e) {
				var files = e.target.files;
				var filesArr = Array.prototype.slice.call(files);
				$(".img-list").html("");
				filesArr.forEach(function(f) {
					if (!f.type.match("image.*")) {
						return;
					}

					sel_files.push(f);
					var reader = new FileReader();
					reader.onload = function(e) {
						var img_html = "<img src='" + e.target.result
								+ "' width='80px' style='margin-right:5px'/>";
						$(".img-list").append(img_html);
					}

					reader.readAsDataURL(f);

				});
			});

});