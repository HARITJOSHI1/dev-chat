import React from "react";
import { Modal, Input, Button, Icon } from "semantic-ui-react";
import mime from "mime-types";

class FileModal extends React.Component {
    state = {
        file: null,
        authorized: ['image/jpeg', 'image/png']
    }

    addFile = e => {
        const file = e.target.files[0];
        this.setState({ file });
    }

    sendFile = file => {
        const {uploadFile, closeModal} = this.props;
        if (file) {
            if (this.isAuthorized(file.name)) {
                const metadata = {contentType: mime.lookup(file.name)};
                uploadFile(file, metadata);
                closeModal();
                this.setState({ file: null });
            }
        }
    }

    isAuthorized(fileName) {
        const mineType = mime.lookup(fileName);
        return this.state.authorized.includes(mineType);
    }

    render() {
        const { modal, closeModal } = this.props;
        const { file } = this.state;
     
        return (
            <Modal basic open={modal} onClose={closeModal}>
                <Modal.Header>Select an Image File</Modal.Header>
                <Modal.Content>
                    <Input onChange={this.addFile} fluid label="File types: jpg, png" name="file" type="file" />
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={this.sendFile.bind(this, file)} color="green" inverted>
                        <Icon name="checkmark" /> Send
                    </Button>
                    <Button color="red" inverted onClick={closeModal}>
                        <Icon name="remove" /> Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default FileModal;