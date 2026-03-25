    // 上传裁剪后的图片
    uploadAvatar(file)
      .then((response) => {
        // uploadAvatar 返回 string
        if (response) {
          ElMessage.success('头像更新成功')
          emit('success', response)
          handleClose()
        } else {
          ElMessage.error('头像更新失败')
        }
      })
      .catch((error) => {
        console.error('Avatar upload failed:', error)
        ElMessage.error('头像更新失败，请重试')
      })
      .finally(() => {
        uploading.value = false
      })
